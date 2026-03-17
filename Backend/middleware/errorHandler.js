export default function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500;

  // Log full error in console
  console.error("❌ Error:", err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
}
