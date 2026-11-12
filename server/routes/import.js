const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { getDb, saveDatabase } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 修复文件名编码：multer 可能将 UTF-8 字节按 Latin-1 解码
function fixFilename(name) {
  if (!name) return name;
  // 检测：如果字符串包含 Latin-1 误解码的中文特征（常见乱码范围），尝试还原
  try {
    const latin1Bytes = Buffer.from(name, 'latin1');
    const utf8Str = latin1Bytes.toString('utf8');
    // 如果还原后包含中文字符且不同于原串，说明原串是乱码
    if (/[\u4e00-\u9fff]/.test(utf8Str) && utf8Str !== name) {
      return utf8Str;
    }
  } catch (_) { /* ignore */ }
  return name;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.originalname = fixFilename(file.originalname);
    cb(null, true);
  },
});

// 获取导入导出历史
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { user_id, action_type } = req.query;

    let sql = `
      SELECT d.*, u.name as user_name
      FROM data_import_history d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.action_type != 'import_school_dict'
    `;
    const params = [];

    if (user_id) {
      sql += ' AND d.user_id = ?';
      params.push(user_id);
    }
    if (action_type) {
      sql += ' AND d.action_type LIKE ?';
      params.push(`%${action_type}%`);
    }

    sql += ' ORDER BY d.created_at DESC';

    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 记录导入导出
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { user_id, action_type, file_name, record_count, status, detail } = req.body;

    const stmt = db.prepare(
      'INSERT INTO data_import_history (user_id, action_type, file_name, record_count, status, detail) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run([
      user_id,
      action_type,
      file_name || null,
      record_count || 0,
      status || 'success',
      detail || null,
    ]);

    saveDatabase();

    res.json({
      success: true,
      data: { id: result.lastInsertRowid },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== 模板下载接口 ==========

const TEMPLATES = {
  school: {
    filename: '学校数据导入模板.xlsx',
    headers: ['学校名称', '所属部门', '区域', '学段', '类型', '当前状态', '归属销售', '归属运营', '创建时间'],
    sample: [['示例学校', '华东区', '广东-广州', '初中', '公立', '初步接触', '张三', '李四', '2025-01-15']],
  },
  'follow-record': {
    filename: '跟进记录导入模板.xlsx',
    headers: ['学校名称', '跟进内容', '下一步计划', '操作人', '跟进时间'],
    sample: [['示例学校', '了解需求', '下周拜访', '张三', '2025-01-15']],
  },
  'operation-record': {
    filename: '运营记录导入模板.xlsx',
    headers: ['学校名称', '记录类型', '服务内容', '操作人', '记录时间'],
    sample: [['示例学校', '日常服务', '设备维护', '李四', '2025-01-15']],
  },
  account: {
    filename: '账号导入模板.xlsx',
    headers: ['姓名', '手机号', '邮箱', '部门', '角色'],
    sample: [['张三', '13800138000', 'zhangsan@example.com', '华东区', '销售']],
  },
};

router.get('/template/:type', (req, res) => {
  const type = req.params.type;
  const tpl = TEMPLATES[type];
  if (!tpl) {
    return res.status(400).json({ success: false, message: '无效的模板类型' });
  }

  try {
    const rows = [tpl.headers, ...tpl.sample];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = tpl.headers.map(() => ({ wch: 16 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '模板');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(tpl.filename)}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== 数据导入接口 ==========

function parseExcel(fileBuffer) {
  const wb = XLSX.read(fileBuffer, { type: 'buffer' });
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows;
}

function findSchoolByName(db, name) {
  const result = db.exec('SELECT id, name FROM schools WHERE name = ?', [name]);
  if (result.length > 0 && result[0].values.length > 0) {
    const row = result[0].values[0];
    return { id: row[0], name: row[1] };
  }
  return null;
}

function normalizeDate(val) {
  if (!val) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (typeof val === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + val * 86400000);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  const str = String(val).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/** 根据姓名查找用户 ID，找不到返回默认登录用户 ID */
function findUserByIdOrName(db, val, defaultUserId) {
  if (!val) return defaultUserId;
  const v = String(val).trim();
  // 先尝试按数字 ID 匹配
  const num = parseInt(v, 10);
  if (!isNaN(num)) {
    const r = db.exec('SELECT id FROM users WHERE id = ?', [num]);
    if (r.length > 0 && r[0].values.length > 0) return num;
  }
  // 按姓名匹配
  const result = db.exec('SELECT id FROM users WHERE name = ?', [v]);
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return defaultUserId;
}

/** 状态值映射 */
const STATUS_MAP = {
  '初步接触': '初步接触',
  '已签约': '已签约',
  '已暂停': '已暂停',
  '已成交': '已成交',
  '已流失': '已流失',
};

function normalizeStatus(val) {
  if (!val) return '初步接触';
  const v = String(val).trim();
  return STATUS_MAP[v] || v;
}

/** 查找或新建学校（用于跟进/运营记录导入） */
function findOrCreateSchool(db, name, defaultSalesId) {
  let school = findSchoolByName(db, name);
  if (school) return { ...school, _existed: true };

  // 自动新建
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  db.prepare(
    `INSERT INTO schools (name, dept, region, grade, type, status, sales_id, created_at, updated_at)
     VALUES (?, null, null, null, null, '初步接触', ?, ?, ?)`
  ).run([name, defaultSalesId, now, now]);

  // 返回新创建的学校 ID
  const lastId = db.prepare('SELECT last_insert_rowid() AS id').get();
  return { id: lastId.id, name, _existed: false };
}

// 导入学校数据
router.post('/import/school', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '请上传文件' });

    const db = getDb();
    const userId = req.user.id;
    const rows = parseExcel(req.file.buffer);

    let successCount = 0;
    let updateCount = 0;
    let insertCount = 0;
    let skipCount = 0;
    const errors = [];

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const insertStmt = db.prepare(
      `INSERT INTO schools (name, dept, region, grade, type, status, sales_id, operator_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE schools SET dept = COALESCE(? , dept), region = COALESCE(? , region),
         grade = COALESCE(? , grade), type = COALESCE(? , type),
         status = COALESCE(? , status), sales_id = COALESCE(? , sales_id),
         operator_id = COALESCE(? , operator_id), updated_at = ?
       WHERE id = ?`
    );

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = String(r['学校名称'] || '').trim();
      if (!name) { skipCount++; continue; }

      const existing = findSchoolByName(db, name);

      try {
        const dept = String(r['所属部门'] || '').trim() || null;
        const region = String(r['区域'] || '').trim() || null;
        const grade = String(r['学段'] || '').trim() || null;
        const type = String(r['类型'] || '').trim() || null;
        const status = normalizeStatus(r['当前状态']);
        const salesId = findUserByIdOrName(db, r['归属销售'], userId);
        const operatorId = findUserByIdOrName(db, r['归属运营'], null);
        const createdAt = normalizeDate(r['创建时间']);

        if (existing) {
          // 更新已有学校
          updateStmt.run([
            dept, region, grade, type, status, salesId, operatorId, now, existing.id,
          ]);
          updateCount++;
        } else {
          // 新建学校
          insertStmt.run([
            name, dept, region, grade, type, status, salesId, operatorId, createdAt, now,
          ]);
          insertCount++;
        }
        successCount++;
      } catch (e) {
        errors.push(`第${i + 2}行 "${name}": ${e.message}`);
      }
    }

    db.prepare(
      'INSERT INTO data_import_history (user_id, action_type, file_name, record_count, status, detail) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([
      userId,
      'import_school',
      req.file.originalname,
      successCount,
      errors.length === 0 ? 'success' : 'partial',
      errors.length ? errors.join('; ') : null,
    ]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        success_count: successCount,
        insert_count: insertCount,
        update_count: updateCount,
        skip_count: skipCount,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 导入跟进记录
router.post('/import/follow-record', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '请上传文件' });

    const db = getDb();
    const userId = req.user.id;
    const rows = parseExcel(req.file.buffer);

    let successCount = 0;
    let skipCount = 0;
    let newSchoolCount = 0;
    const errors = [];

    const insertStmt = db.prepare(
      'INSERT INTO follow_records (school_id, content, next_step, user_id, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const schoolName = String(r['学校名称'] || '').trim();
      if (!schoolName) { skipCount++; continue; }

      // 查找或自动新建学校
      const school = findOrCreateSchool(db, schoolName, userId);
      if (school.id < 0) {
        errors.push(`第${i + 2}行 "${schoolName}": 自动新建学校失败`);
        skipCount++;
        continue;
      }
      if (!school._existed) newSchoolCount++;

      try {
        const userId = findUserByIdOrName(db, r['操作人'], req.user.id);
        const created_at = normalizeDate(r['跟进时间']);
        insertStmt.run([
          school.id,
          String(r['跟进内容'] || '').trim() || null,
          String(r['下一步计划'] || '').trim() || null,
          userId,
          created_at,
        ]);
        successCount++;
      } catch (e) {
        errors.push(`第${i + 2}行 "${schoolName}": ${e.message || String(e)}`);
      }
    }

    db.prepare(
      'INSERT INTO data_import_history (user_id, action_type, file_name, record_count, status, detail) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([
      userId,
      'import_follow_record',
      req.file.originalname,
      successCount,
      errors.length === 0 ? 'success' : 'partial',
      newSchoolCount > 0 ? `自动新建${newSchoolCount}所学校; ${errors.join('; ')}`.trim() : (errors.length ? errors.join('; ') : null),
    ]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        success_count: successCount,
        skip_count: skipCount,
        new_school_count: newSchoolCount,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 导入运营记录
router.post('/import/operation-record', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '请上传文件' });

    const db = getDb();
    const userId = req.user.id;
    const rows = parseExcel(req.file.buffer);

    let successCount = 0;
    let skipCount = 0;
    let newSchoolCount = 0;
    const errors = [];

    const insertStmt = db.prepare(
      'INSERT INTO operation_records (school_id, type, content, user_id, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const schoolName = String(r['学校名称'] || '').trim();
      if (!schoolName) { skipCount++; continue; }

      // 查找或自动新建学校
      const school = findOrCreateSchool(db, schoolName, userId);
      if (school.id < 0) {
        errors.push(`第${i + 2}行 "${schoolName}": 自动新建学校失败`);
        skipCount++;
        continue;
      }
      if (!school._existed) newSchoolCount++;

      try {
        const recordUserId = findUserByIdOrName(db, r['操作人'], req.user.id);
        insertStmt.run([
          school.id,
          String(r['记录类型'] || '运营记录').trim() || '运营记录',
          String(r['服务内容'] || '').trim() || null,
          recordUserId,
          normalizeDate(r['记录时间']),
        ]);
        successCount++;
      } catch (e) {
        errors.push(`第${i + 2}行 "${schoolName}": ${e.message}`);
      }
    }

    db.prepare(
      'INSERT INTO data_import_history (user_id, action_type, file_name, record_count, status, detail) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([
      userId,
      'import_operation_record',
      req.file.originalname,
      successCount,
      errors.length === 0 ? 'success' : 'partial',
      newSchoolCount > 0 ? `自动新建${newSchoolCount}所学校; ${errors.join('; ')}`.trim() : (errors.length ? errors.join('; ') : null),
    ]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        success_count: successCount,
        skip_count: skipCount,
        new_school_count: newSchoolCount,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
