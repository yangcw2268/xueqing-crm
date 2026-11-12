const express = require('express');
const router = express.Router();
const { getDb } = require('../db/init');

// 获取操作日志列表
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { user_id, action_type } = req.query;

    let sql = `
      SELECT a.*, u.name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      sql += ' AND a.user_id = ?';
      params.push(user_id);
    }
    if (action_type) {
      sql += " AND a.action_type LIKE '%" + action_type + "%'";
    }

    sql += ' ORDER BY a.created_at DESC';

    const results = db.prepare(sql).all(...params);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 创建操作日志
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { user_id, action_type, target, detail } = req.body;

    const stmt = db.prepare(
      'INSERT INTO audit_logs (user_id, action_type, target, detail) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(user_id, action_type, target || null, detail || null);

    res.json({
      success: true,
      data: { id: result.lastInsertRowid },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
