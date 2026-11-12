const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'crm.db');
const BACKUPS_DIR = path.join(__dirname, '..', 'data', 'backups');
const MAX_BACKUPS = 10;
let SQL;
let dbInstance;

/**
 * 启动前自动备份数据库
 */
function backupDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      console.log('[备份] 数据库文件不存在，跳过备份');
      return;
    }

    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const now = new Date();
    const timestamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '-' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const backupName = `crm.db.${timestamp}`;
    const backupPath = path.join(BACKUPS_DIR, backupName);

    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`[备份] 数据库已备份: ${backupPath}`);

    // 清理旧备份，只保留最近 MAX_BACKUPS 份
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('crm.db.'))
      .sort()
      .reverse();
    if (files.length > MAX_BACKUPS) {
      files.slice(MAX_BACKUPS).forEach(f => {
        const oldPath = path.join(BACKUPS_DIR, f);
        fs.unlinkSync(oldPath);
        console.log(`[备份] 删除旧备份: ${oldPath}`);
      });
    }
  } catch (e) {
    console.error(`[备份] 备份失败: ${e.message}`);
  }
}

/**
 * 加载数据库（从文件或创建新库）
 */
async function loadDatabase() {
  SQL = await initSqlJs();
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  dbInstance.run('PRAGMA foreign_keys = ON');
  return dbInstance;
}

/**
 * 保存数据库到文件
 */
function saveDatabase() {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * 获取数据库实例
 */
function getDb() {
  if (!dbInstance) {
    throw new Error('数据库未初始化，请先调用 loadDatabase()');
  }
  return dbInstance;
}

/**
 * 创建所有表结构并插入初始数据
 */
async function initDatabase() {
  await loadDatabase();
  const db = getDb();

  // 启动前自动备份
  backupDatabase();

  // ========== 创建表 ==========

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '销售',
      dept TEXT,
      phone TEXT,
      email TEXT,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 迁移：添加飞书相关字段
  console.log('[迁移] 开始检查表结构迁移，数据库已自动备份...');
  try {
    db.exec(`ALTER TABLE users ADD COLUMN feishu_open_id TEXT DEFAULT NULL`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN feishu_avatar TEXT DEFAULT NULL`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN feishu_sync_status TEXT DEFAULT NULL`);
  } catch (e) {}

  // 迁移：添加密码登录开关
  try {
    db.exec(`ALTER TABLE users ADD COLUMN allow_password_login INTEGER DEFAULT 0`);
  } catch (e) {}
  // 迁移：添加新增方式
  try {
    db.exec(`ALTER TABLE users ADD COLUMN source TEXT DEFAULT 'manual'`);
  } catch (e) {}

  // 存量数据回填：source 统一标为 manual
  db.exec(`UPDATE users SET source = 'manual' WHERE source IS NULL OR source = ''`);
  // 超管账号默认开启密码登录（角色为超级管理员的）
  db.exec(`UPDATE users SET allow_password_login = 1 WHERE role = '超级管理员'`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dept TEXT,
      region TEXT,
      grade TEXT,
      type TEXT,
      source_channel TEXT,
      status TEXT DEFAULT '初步接触',
      sales_id INTEGER,
      operator_id INTEGER,
      contact TEXT,
      contact_phone TEXT,
      address TEXT,
      student_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sales_id) REFERENCES users(id),
      FOREIGN KEY (operator_id) REFERENCES users(id)
    )
  `);

  // 迁移：添加 paused_from 字段用于保存暂停前的状态
  try {
  db.exec(`ALTER TABLE schools ADD COLUMN paused_from TEXT DEFAULT NULL`);
} catch (e) {
  // 字段已存在，忽略
}

// 迁移：添加 operator_ids 字段（JSON 数组，存储多个运营人员 ID）
try {
  db.exec(`ALTER TABLE schools ADD COLUMN operator_ids TEXT DEFAULT NULL`);
} catch (e) {}

// 交接相关字段（保留兼容，不再使用）
try {
  db.exec(`ALTER TABLE schools ADD COLUMN assigned_operator_id INTEGER DEFAULT NULL`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE schools ADD COLUMN handover_notes TEXT DEFAULT NULL`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE schools ADD COLUMN handover_time TEXT DEFAULT NULL`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE schools ADD COLUMN reject_reason TEXT DEFAULT NULL`);
} catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      method TEXT,
      content TEXT,
      next_step TEXT,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (school_id) REFERENCES schools(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 迁移：follow_records 增加"跟进后学校状态"字段
  try {
    db.exec(`ALTER TABLE follow_records ADD COLUMN status_after TEXT DEFAULT NULL`);
  } catch (e) {}

  // 迁移：follow_records 增加"提交时状态快照"字段
  try {
    db.exec(`ALTER TABLE follow_records ADD COLUMN record_status TEXT DEFAULT NULL`);
  } catch (e) {}
  // 回填：已有记录用对应学校当前状态作为快照（历史状态无法精确还原）
  db.exec(`UPDATE follow_records SET record_status = (SELECT s.status FROM schools s WHERE s.id = follow_records.school_id)
           WHERE record_status IS NULL`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      file_url TEXT,
      sign_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (school_id) REFERENCES schools(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS device_placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      deploy_date TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (school_id) REFERENCES schools(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS operation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      type TEXT,
      content TEXT,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (school_id) REFERENCES schools(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS school_dict (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT,
      grade TEXT,
      type TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      relation TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (school_id) REFERENCES schools(id)
    )
  `);

  // 操作审计日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      target TEXT,
      detail TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 数据导入导出历史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_import_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      file_name TEXT,
      record_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success',
      detail TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 工作汇报主表
  db.exec(`
    CREATE TABLE IF NOT EXISTS work_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      report_type TEXT NOT NULL,
      period TEXT NOT NULL,
      status TEXT DEFAULT '草稿',
      follow_count INTEGER DEFAULT 0,
      new_school_count INTEGER DEFAULT 0,
      signed_school_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      submitted_at TEXT DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 工作汇报明细表
  db.exec(`
    CREATE TABLE IF NOT EXISTS work_report_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_date TEXT,
      method TEXT,
      school_name TEXT,
      content TEXT,
      next_plan TEXT,
      plan_status TEXT,
      plan_result TEXT,
      plan_time TEXT,
      plan_goal TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (report_id) REFERENCES work_reports(id)
    )
  `);

  // 工作汇报notes字段（已包含在表定义中，保留兼容旧库）
  try {
    db.exec(`ALTER TABLE work_reports ADD COLUMN notes TEXT DEFAULT NULL`);
  } catch (e) {}

  // 月度目标表
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      visit_goal INTEGER DEFAULT 0,
      new_school_goal INTEGER DEFAULT 0,
      signed_amount_goal REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, month)
    )
  `);

  // ========== 创建索引 ==========
  db.exec(`CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_schools_dept ON schools(dept)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_schools_sales ON schools(sales_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_follow_records_school ON follow_records(school_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_follow_records_user ON follow_records(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_contracts_school ON contracts(school_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_device_placements_school ON device_placements(school_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_operation_records_school ON operation_records(school_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_contacts_school ON contacts(school_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON audit_logs(action_type)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_data_import_user ON data_import_history(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_work_reports_user ON work_reports(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_work_reports_period ON work_reports(period)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_work_report_items_report ON work_report_items(report_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_monthly_goals_user ON monthly_goals(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_monthly_goals_month ON monthly_goals(month)`);

  // ========== 插入初始数据 ==========
  const userCount = db.exec('SELECT COUNT(*) as count FROM users');
  const count = userCount[0]?.values?.[0]?.[0] || 0;

  if (count === 0) {
    const hash = bcrypt.hashSync('123456', 10);
    const insertUser = db.prepare('INSERT INTO users (name, password, role, dept, phone, status) VALUES (?, ?, ?, ?, ?, ?)');

    insertUser.run(['张三', hash, '超级管理员', '华东区', '13800138000', 1]);
    insertUser.run(['李四', hash, '销售', '华东区', '13800138001', 1]);
    insertUser.run(['王五', hash, '销售', '华南区', '13800138002', 1]);
    insertUser.run(['赵六', hash, '员工', '华东区', '13800138003', 1]);
    insertUser.run(['孙七', hash, '员工', '华南区', '13800138004', 1]);
    insertUser.run(['周八', hash, '一级部门负责人', '华东区', '13800138005', 1]);

    // 插入初始审计日志
    const insertAudit = db.prepare(
      'INSERT INTO audit_logs (user_id, action_type, target, detail) VALUES (?, ?, ?, ?)'
    );
    insertAudit.run([1, '用户管理', '-', '新增用户李四']);

    // 插入初始导入导出历史
    const insertImport = db.prepare(
      'INSERT INTO data_import_history (user_id, action_type, file_name, record_count, status, detail) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertImport.run([1, '数据导入', 'schools_20261010.xlsx', 15, 'success', '导入学校数据']);
    insertImport.run([1, '数据导入', 'records_20261012.xlsx', 28, 'success', '导入跟进记录']);
    insertImport.run([1, '数据导出', 'schools_export.xlsx', 20, 'success', '导出全部学校数据']);
    insertImport.run([2, '数据导入', 'records_batch.xlsx', 0, 'failed', '文件格式错误']);
    insertImport.run([3, '数据导出', 'contacts_export.xlsx', 35, 'success', '导出联系人数据']);
    insertImport.run([1, '数据导出', 'contracts_export.xlsx', 12, 'success', '导出合同数据']);

    saveDatabase();
  }

  console.log('数据库初始化完成');
}

module.exports = { getDb, initDatabase, loadDatabase, saveDatabase };
