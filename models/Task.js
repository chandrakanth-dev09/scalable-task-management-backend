const pool = require('../config/db');

class Task {
  static async create(userId, title, description, priority, dueDate) {
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description, priority || 'medium', dueDate || null]
    );
    return result.insertId;
  }

  static async findById(id, userId) {
    const [rows] = await pool.query(
      'SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  static async findAll(userId, filters = {}) {
    let query = 'SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.sort) {
      const validSortFields = ['due_date', 'created_at', 'priority', 'status'];
      if (validSortFields.includes(filters.sort)) {
        const order = filters.order && filters.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${filters.sort} ${order}`;
      }
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findAllPaginated(userId, filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 10, 100);
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
    let dataQuery = 'SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      countQuery += ' AND status = ?';
      dataQuery += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      countQuery += ' AND priority = ?';
      dataQuery += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.sort) {
      const validSortFields = ['due_date', 'created_at', 'priority', 'status'];
      if (validSortFields.includes(filters.sort)) {
        const order = filters.order && filters.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        dataQuery += ` ORDER BY ${filters.sort} ${order}`;
      }
    }

    dataQuery += ' LIMIT ? OFFSET ?';

    const [[{ total }]] = await pool.query(countQuery, params);
    const paramsWithLimit = [...params, limit, offset];
    const [rows] = await pool.query(dataQuery, paramsWithLimit);

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, userId, { title, description, priority, dueDate, status }) {
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      values.push(dueDate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async markAsCompleted(id, userId) {
    const [result] = await pool.query(
      'UPDATE tasks SET status = "completed" WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Task;
