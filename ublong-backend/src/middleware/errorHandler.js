function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message, details: err.errors });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry", field: Object.keys(err.keyPattern || {})[0] });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
