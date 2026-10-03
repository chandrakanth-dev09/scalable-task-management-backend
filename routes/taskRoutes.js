const express = require('express');
const { body, query } = require('express-validator');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601()
  ],
  validationMiddleware,
  taskController.createTask
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'completed']),
    query('priority').optional().isIn(['low', 'medium', 'high']),
    query('sort').optional().isIn(['due_date', 'created_at', 'priority', 'status']),
    query('order').optional().isIn(['asc', 'desc'])
  ],
  validationMiddleware,
  taskController.getAllTasks
);

router.get('/:id', taskController.getTask);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601(),
    body('status').optional().isIn(['pending', 'completed'])
  ],
  validationMiddleware,
  taskController.updateTask
);

router.delete('/:id', taskController.deleteTask);

router.patch('/:id/complete', taskController.markTaskAsCompleted);

module.exports = router;
