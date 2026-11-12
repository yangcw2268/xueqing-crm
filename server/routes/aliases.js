const express = require('express');
const { query, queryOne, run } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// ==================== 工作记录 ====================
// POST /api/work-records - 写工作记录（可联动更新学校状态）
router.post('/work-records', async (req, res) => {
  try {
    const { school_id, content, next_step, status_after } = req.body;
    const user_id = req.user.id;
    // 查学校当前状态（用项目已封装的 queryOne，内部正确 bind + getAsObject）
    const schoolRow = await queryOne('SELECT status FROM schools WHERE id = ?', [school_id]);
    if (!schoolRow || !schoolRow.status) return res.status(400).json({ success: false, message: '学校不存在' });
    const oldStatus = schoolRow.status;

    // 插入工作记录（带 status_after）
    const result = await run(
      'INSERT INTO follow_records (school_id, content, next_step, status_after, user_id, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      [school_id, content, next_step, status_after || null, user_id]
    );

    // 联动更新学校状态 + 写操作日志（同一个事务）
    if (status_after && status_after !== oldStatus) {
      require('./records').applyStatusChange(school_id, oldStatus, status_after, user_id);
    }

    res.json({ success: true, data: { id: result } });
  } catch (err) {
    console.error('[POST /api/work-records] 错误:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/work-records - 获取工作记录列表（带学校当前状态）
router.get('/work-records', async (req, res) => {
  try {
    const { school_id } = req.query;
    const user = req.user;

    let sql = `SELECT fr.*, s.name as school_name, s.status as school_status, u.name as user_name
               FROM follow_records fr
               INNER JOIN schools s ON fr.school_id = s.id
               INNER JOIN users u ON fr.user_id = u.id
               WHERE 1=1`;
    const params = [];

    // 角色权限过滤
    if (user.role === '员工') {
      sql += ' AND fr.user_id = ?';
      params.push(user.id);
    } else if (user.role === '一级部门负责人') {
      if (user.dept) {
        sql += ' AND u.dept = ?';
        params.push(user.dept);
      } else {
        sql += ' AND fr.user_id = ?';
        params.push(user.id);
      }
    }

    if (school_id) { sql += ' AND fr.school_id = ?'; params.push(school_id); }

    sql += ' ORDER BY fr.created_at DESC';
    const records = await query(sql, params);
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 合同管理 ====================
// POST /api/contracts - 上传合同
router.post('/contracts', async (req, res) => {
  try {
    const { school_id, file_url, sign_date, notes } = req.body;
    const result = await run(
      'INSERT INTO contracts (school_id, file_url, sign_date, notes) VALUES (?, ?, ?, ?)',
      [school_id, file_url, sign_date, notes]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/contracts - 获取合同信息
router.get('/contracts', async (req, res) => {
  try {
    const { school_id } = req.query;
    let sql = 'SELECT * FROM contracts WHERE 1=1';
    const params = [];
    if (school_id) { sql += ' AND school_id = ?'; params.push(school_id); }
    sql += ' ORDER BY sign_date DESC';
    const contracts = await query(sql, params);
    res.json({ success: true, data: contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 设备投放 ====================
// POST /api/device-placements - 录入设备投放
router.post('/device-placements', async (req, res) => {
  try {
    const { school_id, deploy_date, quantity } = req.body;
    const user_id = req.user.id;
    const result = await run(
      'INSERT INTO device_placements (school_id, deploy_date, quantity, user_id) VALUES (?, ?, ?, ?)',
      [school_id, deploy_date, quantity, user_id]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/device-placements - 获取设备投放列表
router.get('/device-placements', async (req, res) => {
  try {
    const { school_id } = req.query;
    let sql = "SELECT dp.*, s.name as school_name, u.name as user_name, '学情同步笔' as device_type, '已投放' as status FROM device_placements dp INNER JOIN schools s ON dp.school_id = s.id INNER JOIN users u ON dp.user_id = u.id WHERE 1=1";
    const params = [];
    if (school_id) { sql += ' AND dp.school_id = ?'; params.push(school_id); }
    sql += ' ORDER BY dp.deploy_date DESC';
    const placements = await query(sql, params);
    res.json({ success: true, data: placements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 记录管理（汇总查询） ====================
// GET /api/records - 汇总查询（工作记录，带学校当前状态和 status_after）
router.get('/records', async (req, res) => {
  try {
    const { type, start_date, end_date, keyword } = req.query;
    const user = req.user;

    let sql = `SELECT fr.id, fr.school_id, s.name as school_name, s.status as school_status,
                      fr.content, fr.next_step, fr.status_after, fr.record_status,
                      fr.user_id, u.name as user_name, fr.created_at
               FROM follow_records fr
               INNER JOIN schools s ON fr.school_id = s.id
               INNER JOIN users u ON fr.user_id = u.id
               WHERE 1=1`;
    const params = [];

    // 角色权限过滤
    if (user.role === '员工') {
      sql += ' AND fr.user_id = ?';
      params.push(user.id);
    } else if (user.role === '一级部门负责人') {
      if (user.dept) {
        sql += ' AND u.dept = ?';
        params.push(user.dept);
      } else {
        sql += ' AND fr.user_id = ?';
        params.push(user.id);
      }
    }

    // 时间筛选
    if (start_date) {
      sql += ' AND fr.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND fr.created_at <= ?';
      params.push(end_date);
    }

    // 学校名称搜索
    if (keyword) {
      sql += ' AND s.name LIKE ?';
      params.push(`%${keyword}%`);
    }

    sql += ' ORDER BY fr.created_at DESC';

    const records = await query(sql, params);

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
