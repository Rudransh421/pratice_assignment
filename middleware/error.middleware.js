export const errorHandler = (err, req, res, next) => {

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
