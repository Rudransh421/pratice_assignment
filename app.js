import express from "express";
import orderRoutes from "./routes/order.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

export default app;
