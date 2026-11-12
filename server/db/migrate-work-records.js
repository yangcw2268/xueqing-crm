const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'crm.db');

async function migrate() {
  const initSqlJsGlobal = await initSqlJs();

  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new initSqlJsGlobal.Database(fileBuffer);

  try {
    // 1. 角色迁移：销售/运营 → 员工
    db.run("UPDATE users SET role = '员工' WHERE role IN ('销售', '运营')");
    console.log('角色迁移完成');

    // 2. 创建工作记录表
    db.exec(`
      CREATE TABLE IF NOT EXISTS work_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        next_step TEXT,
        user_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (school_id) REFERENCES schools(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('工作记录表创建完成');

    // 3. 迁移跟进记录 → 工作记录（类型默认"拜访"）
    db.exec(`
      INSERT INTO work_records (school_id, type, content, next_step, user_id, created_at)
      SELECT school_id, '拜访', content, next_step, user_id, created_at
      FROM follow_records
    `);
    console.log('跟进记录迁移完成');

    // 4. 迁移运营记录 → 工作记录（类型映射：巡检→巡检, 回访→服务, 培训→培训, 其他→其他, 默认→其他）
    db.exec(`
      INSERT INTO work_records (school_id, type, content, user_id, created_at)
      SELECT school_id,
             CASE
               WHEN type IN ('巡检') THEN '巡检'
               WHEN type IN ('回访', '服务', '部署', '开通') THEN '服务'
               WHEN type IN ('培训') THEN '培训'
               WHEN type IN ('其他') THEN '其他'
               ELSE '其他'
             END as type,
             content,
             user_id,
             created_at
      FROM operation_records
      WHERE type NOT IN ('状态推进', '暂停推进', '恢复推进', '终止推进', '交接申请', '确认交接', '拒绝交接')
    `);
    console.log('运营记录迁移完成');

    // 5. 更新 schools 表：将 sales_id 和 operator_id 合并为负责人字段
    // 先加 employee_id 字段
    try {
      db.exec(`ALTER TABLE schools ADD COLUMN employee_id INTEGER REFERENCES users(id)`);
      console.log('schools 表添加 employee_id 字段');

      // 将 sales_id 迁移到 employee_id
      db.exec(`UPDATE schools SET employee_id = sales_id WHERE sales_id IS NOT NULL`);

      // 如果没有 sales_id 但有 operator_id，也用到 employee_id
      db.exec(`UPDATE schools SET employee_id = operator_id WHERE employee_id IS NULL AND operator_id IS NOT NULL`);
      console.log('schools 表 employee_id 迁移完成');
    } catch (e) {
      console.log('employee_id 字段已存在或迁移跳过:', e.message);
    }

    // 保存
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('数据库保存成功');

  } catch (err) {
    console.error('迁移失败:', err);
    process.exit(1);
  }
}

migrate();
