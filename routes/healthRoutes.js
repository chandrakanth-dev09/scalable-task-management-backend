const express = require('express');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  sendSuccess(res, 200, 'API is running');
});

module.exports = router;
