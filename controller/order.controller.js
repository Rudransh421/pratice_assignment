import orderService from "../services/order.service.js";
import { ApiResponse } from "../utilities/ApiResponse.js";

class OrderController {
  async createOrder(req, res, next) {
    try {
      const order = orderService.createOrder(req.body);

      return res
        .status(201)
        .json(new ApiResponse(201, order, "Order created successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req, res, next) {
    try {
      const order = orderService.getOrderById(req.params.orderId);

      return res
        .status(200)
        .json(new ApiResponse(200, order, "Order retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }
  
  async reserveInventory(req, res, next) {
    try {
      const result = orderService.reserveInventoryForOrder(req.params.orderId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Inventory reserved successfully"));
    } catch (error) {
      console.log("Error reserving inventory for order:", req.params.orderId, error);
      next(error);
    }
  }

  async releaseInventory(req, res, next) {
    try {
      const result = orderService.releaseInventoryForOrder(req.params.orderId);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            result,
            "Inventory released and order marked as failed"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const orders = orderService.getAllOrders();

      return res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
