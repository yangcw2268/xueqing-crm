const express = require('express');
const { query, queryOne, run } = require('../db/query');
const { getDb, saveDatabase } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// 状态流转顺序
const STATUS_FLOW = ['初步接触', '有意向', '方案沟通', '已签约', '运营中', '已到期'];
const ALLOWED_STATUS = [...STATUS_FLOW, '暂停中', '终止推进'];

// GET /api/records - 获取工作记录列表（带提交时状态快照）
router.get('/', async (req, res) => {
  try {
    const { school_id, user_id } = req.query;
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
    if (user_id) { sql += ' AND fr.user_id = ?'; params.push(user_id); }

    sql += ' ORDER BY fr.created_at DESC';
    const records = await query(sql, params);
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 状态变更事务：更新学校状态 + 写操作日志 + 保存数据库
 */
async function applyStatusChange(schoolId, oldStatus, newStatus, userId) {
  const db = getDb();
  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('UPDATE schools SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run([newStatus, schoolId]);
    db.prepare(
      `INSERT INTO operation_records (school_id, type, content, user_id, created_at)
       VALUES (?, '状态变更', ?, ?, datetime('now'))`
    ).run([schoolId, `${oldStatus} -> ${newStatus}`, userId]);
    db.exec('COMMIT');
    saveDatabase();
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

// POST /api/records - 创建工作记录（可联动更新学校状态）
router.post('/', async (req, res) => {
  try {
    const { school_id, content, next_step, status_after } = req.body;
    const userId = req.user.id;

    // 查询学校当前状态
    const school = queryOne('SELECT status FROM schools WHERE id = ?', [school_id]);
    if (!school) return res.status(400).json({ success: false, message: '学校不存在' });
    const oldStatus = school.status;

    // 提交时状态快照：优先取 status_after，否则取学校当前状态
    const recordStatus = status_after || oldStatus;

    // 插入工作记录
    const recordId = run(
      'INSERT INTO follow_records (school_id, content, next_step, status_after, record_status, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))',
      [school_id, content, next_step, status_after || null, recordStatus, userId]
    );

    // 如果指定了新状态且与当前不同，联动更新
    if (status_after && status_after !== oldStatus && ALLOWED_STATUS.includes(status_after)) {
      await applyStatusChange(school_id, oldStatus, status_after, userId);
    }

    res.json({ success: true, data: { id: recordId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/records/:id - 更新工作记录（可联动更新学校状态）
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, next_step, status_after } = req.body;

    const updates = [];
    const params = [];
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (next_step !== undefined) { updates.push('next_step = ?'); params.push(next_step); }
    if (status_after !== undefined) {
      updates.push('status_after = ?'); params.push(status_after || null);
      // 更新快照：有 status_after 取变更后的值，否则取学校当前状态
      const existingRecord = queryOne('SELECT school_id FROM follow_records WHERE id = ?', [id]);
      if (existingRecord) {
        const school = queryOne('SELECT status FROM schools WHERE id = ?', [existingRecord.school_id]);
        const newRecordStatus = status_after || (school ? school.status : null);
        if (newRecordStatus) {
          updates.push('record_status = ?'); params.push(newRecordStatus);
        }
      }
    }
    if (updates.length === 0) return res.json({ success: true });
    params.push(id);

    run(`UPDATE follow_records SET ${updates.join(', ')} WHERE id = ?`, params);

    // 联动状态变更
    if (status_after) {
      const record = queryOne('SELECT school_id FROM follow_records WHERE id = ?', [id]);
      if (record) {
        const school = queryOne('SELECT status FROM schools WHERE id = ?', [record.school_id]);
        if (school && status_after !== school.status && ALLOWED_STATUS.includes(status_after)) {
          await applyStatusChange(record.school_id, school.status, status_after, req.user.id);
        }
      }
    }

    res.json({ success: true, data: { id: Number(id) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/contracts - 获取合同列表
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

// POST /api/contracts - 创建合同
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

// GET /api/device_placements - 获取设备投放记录
router.get('/device_placements', async (req, res) => {
  try {
    const { school_id } = req.query;
    let sql = 'SELECT dp.*, u.name as user_name FROM device_placements dp INNER JOIN users u ON dp.user_id = u.id WHERE 1=1';
    const params = [];
    if (school_id) { sql += ' AND dp.school_id = ?'; params.push(school_id); }
    sql += ' ORDER BY dp.place_date DESC';
    const placements = await query(sql, params);
    res.json({ success: true, data: placements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/device_placements - 创建设备投放记录
router.post('/device_placements', async (req, res) => {
  try {
    const { school_id, deploy_date, quantity, user_id } = req.body;
    const result = await run(
      'INSERT INTO device_placements (school_id, deploy_date, quantity, user_id) VALUES (?, ?, ?, ?)',
      [school_id, deploy_date, quantity, user_id]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.applyStatusChange = applyStatusChange;
