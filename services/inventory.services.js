import { db } from "../db/db.js";
import { ApiError } from "../utilities/ApiError.js";

class InventoryService {
  checkAvailability(items) {
    const insufficientItems = [];

    for (const item of items) {
      const inventoryItem = db.inventory.get(item.productId);

      if (!inventoryItem) {
        insufficientItems.push({
          productId: item.productId,
          reason: "Product not found",
          requested: item.quantity,
          available: 0,
        });
        continue;
      }

      const availableStock = inventoryItem.available - inventoryItem.reserved;

      if (availableStock < item.quantity) {
        insufficientItems.push({
          productId: item.productId,
          name: inventoryItem.name,
          reason: "Insufficient stock",
          requested: item.quantity,
          available: availableStock,
        });
      }
    }

    return {
      available: insufficientItems.length === 0,
      insufficientItems,
    };
  }

  reserveInventory(orderId, items) {
    const availabilityCheck = this.checkAvailability(items);

    if (!availabilityCheck.available) {
      throw new ApiError(
        400,
        "Cannot reserve inventory - insufficient stock",
        availabilityCheck.insufficientItems
      );
    }

    const reservedItems = [];

    try {
      for (const item of items) {
        const inventoryItem = db.inventory.get(item.productId);
        inventoryItem.reserved += item.quantity;

        reservedItems.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      db.reservations.set(orderId, reservedItems);

      return {
        orderId,
        reservedItems,
        reservedAt: new Date().toISOString(),
      };
    } catch (error) {
      this._rollbackReservation(reservedItems);
      throw error;
    }
  }

  releaseInventory(orderId) {
    const reservation = db.reservations.get(orderId);

    if (!reservation) {
      throw new ApiError(404, "No inventory reservation found for this order");
    }

    for (const item of reservation) {
      const inventoryItem = db.inventory.get(item.productId);

      if (inventoryItem) {
        inventoryItem.reserved = Math.max(
          0,
          inventoryItem.reserved - item.quantity
        );
      }
    }

    db.reservations.delete(orderId);

    return {
      orderId,
      releasedItems: reservation,
      releasedAt: new Date().toISOString(),
    };
  }

  getInventoryStatus(productId) {
    const item = db.inventory.get(productId);

    if (!item) {
      throw new ApiError(404, "Product not found in inventory");
    }

    return {
      productId: item.productId,
      name: item.name,
      totalStock: item.available,
      reservedStock: item.reserved,
      availableStock: item.available - item.reserved,
    };
  }

  _rollbackReservation(reservedItems) {
    for (const item of reservedItems) {
      const inventoryItem = db.inventory.get(item.productId);
      if (inventoryItem) {
        inventoryItem.reserved = Math.max(
          0,
          inventoryItem.reserved - item.quantity
        );
      }
    }
  }
}

export default new InventoryService();
