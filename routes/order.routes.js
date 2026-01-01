import express from "express";
import orderController from "../controller/order.controller.js";

const router = express.Router();


router.post("/", orderController.createOrder);


router.get("/", orderController.getAllOrders);


router.get("/:orderId", orderController.getOrder);


router.post("/:orderId/reserve-inventory", orderController.reserveInventory);


router.post("/:orderId/release-inventory", orderController.releaseInventory);

export default router;
