const { sendError } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.message === 'No fields to update') {
    return sendError(res, 400, 'No fields to update');
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return sendError(res, 409, 'Email already exists');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return sendError(res, 400, 'Invalid user or task');
  }

  return sendError(res, 500, 'Internal server error');
};

module.exports = errorMiddleware;
