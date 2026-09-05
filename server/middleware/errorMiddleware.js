const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === 11000) return res.status(409).json({ error: 'A record with these details already exists' });
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be smaller than 5 MB' });
  if (error.name === 'CastError' || error.name === 'ValidationError') return res.status(400).json({ error: 'Invalid input', details: error.message });
  const status = error.status || error.statusCode || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong. Please try again.' : error.message });
};
module.exports = { errorHandler };
