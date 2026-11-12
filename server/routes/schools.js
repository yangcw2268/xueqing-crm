const express = require('express');
const XLSX = require('xlsx');
const { query, queryOne, run, exec } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// ========== 辅助函数：写入审计日志 ==========
async function writeAuditLog(req, user, actionType, target, detail) {
  try {
    await run(
      `INSERT INTO audit_logs (user_id, action_type, target, detail) VALUES (?, ?, ?, ?)`,
      [user.id, actionType, target, detail]
    );
  } catch (e) {
    console.error('写入审计日志失败:', e);
  }
}

// 状态流转顺序
const STATUS_FLOW = ['初步接触', '有意向', '方案沟通', '已签约', '运营中', '已到期'];

// ---------- 学校字典接口 ----------

// GET /api/school-dict - 搜索学校字典
router.get('/school-dict', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (keyword) {
      const dicts = await query('SELECT * FROM school_dict WHERE name LIKE ? ORDER BY name', [`%${keyword}%`]);
      return res.json({ success: true, data: dicts });
    }
    const dicts = await query('SELECT * FROM school_dict ORDER BY created_at DESC');
    res.json({ success: true, data: dicts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/school-dict - 新建学校字典
router.post('/school-dict', async (req, res) => {
  try {
    const { name, region, grade, type } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '学校名称不能为空' });
    const result = await run(
      'INSERT INTO school_dict (name, region, grade, type, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [name, region || null, grade || null, type || null]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 学校列表及统计 ----------

// GET /api/schools - 获取学校列表（带角色权限过滤）
router.get('/', async (req, res) => {
  try {
    const { status, dept, sales, keyword } = req.query;
    const user = req.user;
    let sql = 'SELECT s.*, u.name as sales_name, u2.name as operator_name, (SELECT MAX(f.created_at) FROM follow_records f WHERE f.school_id = s.id) as last_follow_at, (SELECT o.created_at FROM operation_records o WHERE o.school_id = s.id AND o.type NOT IN (\'状态推进\',\'暂停推进\',\'恢复推进\',\'终止推进\') ORDER BY o.created_at DESC LIMIT 1) as last_operation_at, (SELECT o.content FROM operation_records o WHERE o.school_id = s.id AND o.type NOT IN (\'状态推进\',\'暂停推进\',\'恢复推进\',\'终止推进\') ORDER BY o.created_at DESC LIMIT 1) as last_operation_content FROM schools s LEFT JOIN users u ON s.sales_id = u.id LEFT JOIN users u2 ON s.operator_id = u2.id WHERE 1=1';
    const params = [];

    // 角色权限过滤
    if (user.role === '销售') {
      // 销售只能看到自己负责的学校
      sql += ' AND s.sales_id = ?';
      params.push(user.id);
    } else if (user.role === '员工') {
      // 员工可以看到自己负责的学校（sales_id 或 operator_id 或 operator_ids 中包含自己）
      sql += ' AND (s.sales_id = ? OR s.operator_id = ? OR s.operator_ids LIKE ?)';
      params.push(user.id, user.id, `%${user.id}%`);
    } else if (user.role === '一级部门负责人') {
      // 部门负责人看本部门
      sql += ' AND s.dept = ?';
      params.push(user.dept);
    }
    // 超级管理员看全部，不添加过滤条件

    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    if (dept) { sql += ' AND s.dept = ?'; params.push(dept); }
    if (sales) { sql += ' AND s.sales_id = ?'; params.push(sales); }
    if (keyword) { sql += ' AND s.name LIKE ?'; params.push(`%${keyword}%`); }

    sql += ' ORDER BY s.created_at DESC';
    const schools = await query(sql, params);
    res.json({ success: true, data: schools });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/schools/stats - 获取学校统计（必须在 /:id 之前）
router.get('/stats', async (req, res) => {
  try {
    const user = req.user;
    let deptFilter = '';
    let salesFilter = '';
    let operatorFilter = '';
    if (user.role === '销售') {
      salesFilter = ` AND s.sales_id = ${user.id}`;
    } else if (user.role === '员工') {
      operatorFilter = ` AND (s.sales_id = ${user.id} OR s.operator_id = ${user.id} OR s.operator_ids LIKE '%${user.id}%')`;
    } else if (user.role === '一级部门负责人') {
      deptFilter = ` AND s.dept = '${user.dept}'`;
    }
    const baseWhere = `WHERE 1=1${deptFilter}${salesFilter}${operatorFilter}`;

    // Tab 状态与数据库状态的映射
    const statusTabs = [
      { tab: '全部', dbStatus: null },
      { tab: '初步接触', dbStatus: '初步接触' },
      { tab: '有意向', dbStatus: '有意向' },
      { tab: '方案沟通', dbStatus: '方案沟通' },
      { tab: '已签约', dbStatus: '已签约' },
      { tab: '运营中', dbStatus: '运营中' },
      { tab: '已到期', dbStatus: '已到期' },
      { tab: '暂停中', dbStatus: '暂停中' },
      { tab: '已终止', dbStatus: '终止推进' },
    ];

    const result = {};
    for (const { tab, dbStatus } of statusTabs) {
      let sql;
      if (dbStatus === null) {
        sql = `SELECT COUNT(*) as count FROM schools s ${baseWhere}`;
      } else {
        sql = `SELECT COUNT(*) as count FROM schools s ${baseWhere} AND s.status = '${dbStatus}'`;
      }
      const row = await queryOne(sql);
      result[tab] = row.count;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/schools/export - 导出学校列表为 Excel
router.get('/export', async (req, res) => {
  try {
    const { status, dept, sales, keyword } = req.query;
    const user = req.user;

    // 构建 SQL（复用列表查询逻辑，增加权限过滤）
    let sql = `
      SELECT s.*, u.name as sales_name, u2.name as operator_name,
             (SELECT MAX(f.created_at) FROM follow_records f WHERE f.school_id = s.id) as last_follow_at
      FROM schools s
      LEFT JOIN users u ON s.sales_id = u.id
      LEFT JOIN users u2 ON s.operator_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    // 角色权限过滤（与 GET /api/schools 保持一致）
    if (user.role === '销售') {
      sql += ' AND s.sales_id = ?';
      params.push(user.id);
    } else if (user.role === '员工') {
      sql += ' AND (s.sales_id = ? OR s.operator_id = ? OR s.operator_ids LIKE ?)';
      params.push(user.id, user.id, `%${user.id}%`);
    } else if (user.role === '一级部门负责人') {
      sql += ' AND s.dept = ?';
      params.push(user.dept);
    }

    // 应用筛选条件
    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    if (dept) { sql += ' AND s.dept = ?'; params.push(dept); }
    if (sales) { sql += ' AND u.name = ?'; params.push(sales); }
    if (keyword) {
      sql += ' AND (s.name LIKE ? OR s.region LIKE ? OR s.grade LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY s.created_at DESC';

    const schools = await query(sql, params);

    if (!schools || schools.length === 0) {
      return res.status(400).json({ success: false, message: '当前列表无数据可导出' });
    }

    // 预加载所有用户，用于解析 operator_ids
    const allUsers = await query('SELECT id, name FROM users');
    const userMap = {};
    allUsers.forEach(u => { userMap[u.id] = u.name; });

    // 组装导出行
    const rows = schools.map(s => {
      // 解析 operator_ids（JSON 数组字符串）
      let operatorNames = [];
      if (s.operator_ids) {
        try {
          const ids = typeof s.operator_ids === 'string' ? JSON.parse(s.operator_ids) : s.operator_ids;
          if (Array.isArray(ids)) {
            operatorNames = ids.map(id => userMap[id]).filter(Boolean);
          }
        } catch (_) { /* ignore */ }
      }
      // 单 operator_id 也加上
      if (s.operator_name && !operatorNames.includes(s.operator_name)) {
        operatorNames.unshift(s.operator_name);
      }
      const operators = operatorNames.join('、') || '';

      // 日期格式化
      const lastFollow = s.last_follow_at ? String(s.last_follow_at).slice(0, 10) : '';
      const createdAt = s.created_at ? String(s.created_at).slice(0, 10) : '';

      return {
        '学校名称': s.name || '',
        '区域': s.region || '',
        '学段': s.grade || '',
        '学校类型': s.type || '',
        '当前状态': s.status || '',
        '所属部门': s.dept || '',
        '销售人员': s.sales_name || '',
        '运营人员': operators,
        '最新跟进时间': lastFollow,
        '新建学校时间': createdAt,
      };
    });

    // 生成 Excel
    const ws = XLSX.utils.json_to_sheet(rows);
    // 列宽自适应
    ws['!cols'] = [
      { wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 18 },
      { wch: 14 }, { wch: 14 },
    ];
    // 冻结首行
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '学校列表');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 文件名
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const condLabel = status || '全部';
    const filename = `学校列表_${condLabel}_${dateStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 学校状态流转接口（必须在 /:id 之前） ----------

// POST /api/schools/:id/advance - 推进到下一阶段
router.post('/:id/advance', async (req, res) => {
  try {
    const school = await queryOne('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    if (!school) return res.status(404).json({ success: false, message: '学校不存在' });

    const currentIndex = STATUS_FLOW.indexOf(school.status);
    if (currentIndex < 0) {
      return res.status(400).json({ success: false, message: `当前状态 "${school.status}" 不在标准流程中，无法推进` });
    }
    if (currentIndex >= STATUS_FLOW.length - 1) {
      return res.status(400).json({ success: false, message: '已在最后阶段，无法继续推进' });
    }

    const nextStatus = STATUS_FLOW[currentIndex + 1];
    await run("UPDATE schools SET status = ?, updated_at = datetime('now') WHERE id = ?", [nextStatus, req.params.id]);

    // 记录操作日志
    await run(
      'INSERT INTO operation_records (user_id, school_id, type, content, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [req.user.id, req.params.id, '状态推进', `${school.status} -> ${nextStatus}`]
    );

    res.json({ success: true, data: { status: nextStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/schools/:id/pause - 暂停推进
router.post('/:id/pause', async (req, res) => {
  try {
    const school = await queryOne('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    if (!school) return res.status(404).json({ success: false, message: '学校不存在' });
    if (school.status === '暂停中') {
      return res.status(400).json({ success: false, message: '学校已处于暂停状态' });
    }

    await run("UPDATE schools SET status = '暂停中', paused_from = ?, updated_at = datetime('now') WHERE id = ?", [school.status, req.params.id]);

    await run(
      'INSERT INTO operation_records (user_id, school_id, type, content, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [req.user.id, req.params.id, '暂停推进', school.status + ' -> 暂停中']
    );

    res.json({ success: true, data: { status: '暂停中', paused_from: school.status } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/schools/:id/resume - 恢复推进
router.post('/:id/resume', async (req, res) => {
  try {
    const school = await queryOne('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    if (!school) return res.status(404).json({ success: false, message: '学校不存在' });
    if (school.status !== '暂停中') {
      return res.status(400).json({ success: false, message: '只有暂停状态的学校才能恢复' });
    }

    // 恢复到暂停前的状态
    if (!school.paused_from) {
      return res.status(400).json({ success: false, message: '无法确定暂停前的状态，请联系管理员' });
    }
    const resumeStatus = school.paused_from;
    await run("UPDATE schools SET status = ?, paused_from = NULL, updated_at = datetime('now') WHERE id = ?", [resumeStatus, req.params.id]);

    await run(
      'INSERT INTO operation_records (user_id, school_id, type, content, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [req.user.id, req.params.id, '恢复推进', '暂停中 -> ' + resumeStatus]
    );

    res.json({ success: true, data: { status: resumeStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/schools/:id/terminate - 终止推进
router.post('/:id/terminate', async (req, res) => {
  try {
    const school = await queryOne('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    if (!school) return res.status(404).json({ success: false, message: '学校不存在' });
    if (school.status === '终止推进') {
      return res.status(400).json({ success: false, message: '学校已处于终止状态' });
    }

    await run("UPDATE schools SET status = '终止推进', updated_at = datetime('now') WHERE id = ?", [req.params.id]);

    await run(
      'INSERT INTO operation_records (user_id, school_id, type, content, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [req.user.id, req.params.id, '终止推进', school.status + ' -> 终止推进']
    );

    res.json({ success: true, data: { status: '终止推进' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 学校 CRUD ----------

// GET /api/schools/:id - 获取学校详情
router.get('/:id', async (req, res) => {
  try {
    const school = await queryOne('SELECT s.*, u.name as sales_name, u2.name as operator_name FROM schools s LEFT JOIN users u ON s.sales_id = u.id LEFT JOIN users u2 ON s.operator_id = u2.id WHERE s.id = ?', [req.params.id]);
    if (!school) return res.status(404).json({ success: false, message: '学校不存在' });
    res.json({ success: true, data: school });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/schools - 创建学校（自动填充 sales_id 和 dept）
router.post('/', async (req, res) => {
  try {
    console.log('[DEBUG schools POST] req.body:', JSON.stringify(req.body));
    console.log('[DEBUG schools POST] req.user:', JSON.stringify(req.user));
    const { name, region, grade, type, source_channel, status } = req.body;
    const user = req.user;

    // 查重：检查是否已存在同名学校
    const existing = await queryOne('SELECT id FROM schools WHERE name = ?', [name]);
    if (existing) {
      return res.status(400).json({ success: false, message: '该学校已存在' });
    }

    // 自动填充归属销售为当前用户，部门从当前用户带出
    const sales_id = user.id;
    const dept = user.dept;

    const result = await run(
      'INSERT INTO schools (name, dept, region, grade, type, source_channel, status, sales_id, operator_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
      [name, dept, region, grade, type, source_channel, status || '初步接触', sales_id, null]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/schools/:id - 更新学校
router.put('/:id', async (req, res) => {
  try {
    const { name, dept, region, grade, type, source_channel, status, sales_id, operator_id, operatorIds } = req.body;
    const updates = [];
    const params = [];
    const fields = { name, dept, region, grade, type, source_channel, status, sales_id, operator_id };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    // 处理 operator_ids（JSON 数组字符串）
    if (operatorIds !== undefined) {
      updates.push(`operator_ids = ?`);
      params.push(Array.isArray(operatorIds) ? JSON.stringify(operatorIds) : operatorIds);
    }
    updates.push('updated_at = datetime(\'now\')');
    params.push(req.params.id);
    await run(`UPDATE schools SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/schools/:id - 删除学校
router.delete('/:id', async (req, res) => {
  try {
    // 只有超级管理员可以删除学校
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '只有超级管理员可以删除学校' });
    }
    const school = await queryOne('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    if (!school) {
      return res.status(404).json({ success: false, message: '学校不存在' });
    }
    // 删除关联数据
    await run('DELETE FROM follow_records WHERE school_id = ?', [req.params.id]);
    await run('DELETE FROM contacts WHERE school_id = ?', [req.params.id]);
    await run('DELETE FROM contracts WHERE school_id = ?', [req.params.id]);
    await run('DELETE FROM device_placements WHERE school_id = ?', [req.params.id]);
    await run('DELETE FROM operation_records WHERE school_id = ?', [req.params.id]);

    // 删除学校
    await run('DELETE FROM schools WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 学校联系人 ----------

// GET /api/schools/:id/contacts - 获取学校联系人列表
router.get('/:id/contacts', async (req, res) => {
  try {
    const contacts = await query('SELECT * FROM contacts WHERE school_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/schools/:id/contacts - 添加联系人
router.post('/:id/contacts', async (req, res) => {
  try {
    const { name, role, phone, relation } = req.body;
    const result = await run(
      'INSERT INTO contacts (school_id, name, role, phone, relation, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      [req.params.id, name, role, phone || null, relation]
    );
    // 写入联系人变更审计日志
    await writeAuditLog(req, req.user, 'contact', req.params.id,
      `新增联系人：${name}${phone ? ' ' + phone : ''}${role ? ' ' + role : ''}`);
    res.json({ success: true, data: { id: result, school_id: req.params.id, name, role, phone: phone || null, relation } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/schools/:id/contacts/:contactId - 更新联系人
router.put('/:id/contacts/:contactId', async (req, res) => {
  try {
    const { name, role, phone, relation } = req.body;
    // 读取旧数据
    const old = await queryOne('SELECT * FROM contacts WHERE id = ? AND school_id = ?', [req.params.contactId, req.params.id]);
    await run(
      'UPDATE contacts SET name=?, role=?, phone=?, relation=?, updated_at=datetime(\'now\') WHERE id=? AND school_id=?',
      [name, role, phone || null, relation, req.params.contactId, req.params.id]
    );
    // 构建变更详情
    const changes = [];
    if (old && old.name !== name) changes.push(`姓名"${old.name}"→"${name}"`);
    if (old && (old.phone || '') !== (phone || '')) changes.push(`电话"${old.phone || ''}"→"${phone || ''}"`);
    if (old && (old.role || '') !== (role || '')) changes.push(`职务"${old.role || ''}"→"${role || ''}"`);
    const changeText = changes.length > 0 ? changes.join(', ') : '联系人信息修改';
    await writeAuditLog(req, req.user, 'contact', req.params.id,
      `编辑联系人：${name} ${changeText}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/schools/:id/contacts/:contactId - 删除联系人
router.delete('/:id/contacts/:contactId', async (req, res) => {
  try {
    const old = await queryOne('SELECT * FROM contacts WHERE id = ? AND school_id = ?', [req.params.contactId, req.params.id]);
    await run('DELETE FROM contacts WHERE id = ? AND school_id = ?', [req.params.contactId, req.params.id]);
    // 写入联系人变更审计日志
    await writeAuditLog(req, req.user, 'contact', req.params.id,
      `删除联系人：${old ? old.name : ''}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
