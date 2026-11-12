const express = require('express');
const { query, queryOne, run } = require('../db/query');
const { getDb, saveDatabase } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();

router.use(authMiddleware);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/school-dict/import - 批量导入学校字典
router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传文件' });
    }

    const db = getDb();
    const userId = req.user.id;
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const wsName = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wsName], { defval: '' });

    let successCount = 0;
    let skipCount = 0;
    let duplicateCount = 0;
    const errors = [];

    const insertStmt = db.prepare(
      'INSERT INTO school_dict (name, region, grade, type, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    );

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = String(r['学校名称'] || r['name'] || '').trim();
      if (!name) {
        skipCount++;
        continue;
      }

      // 查重：检查学校名是否已存在
      const existing = queryOne('SELECT id FROM school_dict WHERE name = ?', [name]);
      if (existing) {
        duplicateCount++;
        errors.push(`第${i + 2}行 "${name}": 学校名已存在，跳过`);
        continue;
      }

      try {
        const region = String(r['学校区域'] || r['区域'] || r['region'] || '').trim() || null;
        const grade = String(r['学段'] || r['grade'] || '').trim() || null;
        const type = String(r['学校类型'] || r['类型'] || r['type'] || '').trim() || null;

        // 校验学校类型：只接受 公办/民办
        if (type && type !== '公办' && type !== '民办') {
          skipCount++;
          errors.push(`第${i + 2}行 "${name}": 学校类型"${type}"无效，只接受公办/民办，跳过`);
          continue;
        }

        insertStmt.run([name, region, grade, type]);
        successCount++;
      } catch (e) {
        errors.push(`第${i + 2}行 "${name}": ${e.message}`);
      }
    }

    saveDatabase();

    res.json({
      success: true,
      data: {
        success_count: successCount,
        skip_count: skipCount,
        duplicate_count: duplicateCount,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/school-dict - 获取学校字典列表
router.get('/', async (req, res) => {
  try {
    const dict = await query('SELECT * FROM school_dict ORDER BY created_at DESC');
    res.json({ success: true, data: dict });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/school-dict - 新增学校字典
router.post('/', async (req, res) => {
  try {
    const { name, region, grade, type } = req.body;
    const result = await run(
      'INSERT INTO school_dict (name, region, grade, type, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [name, region, grade, type]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/school-dict/:id - 编辑学校字典
router.put('/:id', async (req, res) => {
  try {
    const { name, region, grade, type } = req.body;
    const updates = [];
    const params = [];
    const fields = { name, region, grade, type };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (updates.length === 0) return res.json({ success: true });
    params.push(req.params.id);
    await run(`UPDATE school_dict SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/school-dict/:id - 删除学校字典
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM school_dict WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
