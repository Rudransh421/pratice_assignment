import { db, generateId } from "../db/db.js";
import { ApiError } from "../utilities/ApiError.js";
import { Order, OrderStatus } from "../models/order.model.js";
import inventoryService from "./inventory.services.js";

class OrderService {
  validateOrderData(orderData) {
    const errors = [];

    // Validate customer ID
    if (!orderData.customerId || typeof orderData.customerId !== "string") {
      errors.push({ field: "customerId", message: "Customer ID is required" });
    }

    if (
      !orderData.items ||
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0
    ) {
      errors.push({
        field: "items",
        message: "Order must contain at least one item",
      });
    } else {
      orderData.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push({
            field: `items[${index}].productId`,
            message: "Product ID is required",
          });
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push({
            field: `items[${index}].quantity`,
            message: "Quantity must be positive",
          });
        }
        if (!item.price || item.price <= 0) {
          errors.push({
            field: `items[${index}].price`,
            message: "Price must be positive",
          });
        }

        if (item.productId && !db.inventory.has(item.productId)) {
          errors.push({
            field: `items[${index}].productId`,
            message: `Product ${item.productId} does not exist`,
          });
        }
      });
    }

    if (!orderData.shippingAddress) {
      errors.push({
        field: "shippingAddress",
        message: "Shipping address is required",
      });
    } else {
      const addr = orderData.shippingAddress;
      if (!addr.street || !addr.city || !addr.zipCode || !addr.country) {
        errors.push({
          field: "shippingAddress",
          message: "Address must include street, city, zipCode, and country",
        });
      }
    }

    if (errors.length > 0) {
      throw new ApiError(400, "Order validation failed", errors);
    }
  }

  createOrder(orderData) {
    this.validateOrderData(orderData);

    const totalAmount = Order.calculateTotal(orderData.items);

    const order = new Order({
      orderId: generateId(),
      customerId: orderData.customerId,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      totalAmount,
      status: OrderStatus.CREATED,
    });

    db.orders.set(order.orderId, order);

    return order;
  }

  getOrderById(orderId) {
    const order = db.orders.get(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }

  reserveInventoryForOrder(orderId) {
    const order = this.getOrderById(orderId);
    console.log("Reserving inventory for order:", orderId);

    if (!order.canReserveInventory()) {
      throw new ApiError(
        400,
        `Cannot reserve inventory for order in ${order.status} status`,
        [{ field: "status", message: "Order must be in CREATED status" }]
      );
    }

    const reservation = inventoryService.reserveInventory(
      order.orderId,
      order.items
    );

    order.updateStatus(OrderStatus.RESERVED);
    db.orders.set(order.orderId, order);

    return {
      order,
      reservation,
    };
  }

  releaseInventoryForOrder(orderId) {
    const order = this.getOrderById(orderId);

    if (!order.canReleaseInventory()) {
      throw new ApiError(
        400,
        `Cannot release inventory for order in ${order.status} status`,
        [{ field: "status", message: "Order must be in RESERVED status" }]
      );
    }

    const release = inventoryService.releaseInventory(order.orderId);

    order.updateStatus(OrderStatus.FAILED, "Inventory released by user action");
    db.orders.set(order.orderId, order);

    return {
      order,
      release,
    };
  }

  getAllOrders() {
    return Array.from(db.orders.values());
  }
}

export default new OrderService();
