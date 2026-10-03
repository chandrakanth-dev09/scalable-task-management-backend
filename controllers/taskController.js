const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  const userId = req.user.id;

  const taskId = await Task.create(userId, title, description, priority, dueDate);

  const task = await Task.findById(taskId, userId);

  return sendSuccess(res, 201, 'Task created successfully', task);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id, req.user.id);

  if (!task) {
    return sendError(res, 404, 'Task not found');
  }

  return sendSuccess(res, 200, 'Task retrieved successfully', task);
});

const getAllTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page, limit, status, priority, sort, order } = req.query;

  const filters = {
    page,
    limit,
    status,
    priority,
    sort,
    order
  };

  const { data, pagination } = await Task.findAllPaginated(userId, filters);

  return sendSuccess(res, 200, 'Tasks retrieved successfully', data, pagination);
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, status } = req.body;

  const task = await Task.findById(req.params.id, req.user.id);
  if (!task) {
    return sendError(res, 404, 'Task not found');
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (status !== undefined) updateData.status = status;

  await Task.update(req.params.id, req.user.id, updateData);
  const updatedTask = await Task.findById(req.params.id, req.user.id);

  return sendSuccess(res, 200, 'Task updated successfully', updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id, req.user.id);
  if (!task) {
    return sendError(res, 404, 'Task not found');
  }

  await Task.delete(req.params.id, req.user.id);
  return sendSuccess(res, 200, 'Task deleted successfully');
});

const markTaskAsCompleted = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id, req.user.id);
  if (!task) {
    return sendError(res, 404, 'Task not found');
  }

  await Task.markAsCompleted(req.params.id, req.user.id);
  const completedTask = await Task.findById(req.params.id, req.user.id);

  return sendSuccess(res, 200, 'Task marked as completed', completedTask);
});

module.exports = {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  markTaskAsCompleted
};
