const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    return sendError(res, 400, 'Validation failed', formattedErrors);
  }

  next();
};

module.exports = validationMiddleware;
