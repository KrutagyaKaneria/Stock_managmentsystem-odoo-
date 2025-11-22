// src/middleware/error.middleware.js

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
