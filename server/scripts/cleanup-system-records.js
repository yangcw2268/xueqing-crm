/**
 * 清理 operation_records 表中系统自动生成的记录
 * 只保留手动写的运营记录
 */
const { loadDatabase, getDb, saveDatabase } = require('../db/init');

(async () => {
  await loadDatabase();
  const db = getDb();

  // 系统自动生成的记录类型
  const systemTypes = [
    '状态推进',
    '暂停推进',
    '恢复推进',
    '终止推进',
    '交接申请',
    '确认交接',
    '拒绝交接',
  ];

  // 先查看清理前的数据
  const allResult = db.exec('SELECT id, type, content FROM operation_records ORDER BY id');
  console.log('清理前的所有运营记录：');
  if (allResult.length > 0) {
    allResult[0].values.forEach(row => {
      console.log(`  id=${row[0]}, type="${row[1]}", content="${row[2]}"`);
    });
  } else {
    console.log('  无记录');
  }

  // 构建 DELETE 语句
  const placeholders = systemTypes.map(() => '?').join(', ');
  const sql = `DELETE FROM operation_records WHERE type IN (${placeholders})`;
  const stmt = db.prepare(sql);
  const info = stmt.run(systemTypes);

  console.log(`\n已删除 ${info.changes} 条系统记录`);

  // 查看清理后的数据
  const remaining = db.exec('SELECT id, type, content FROM operation_records ORDER BY id');
  console.log('\n清理后的运营记录：');
  if (remaining.length > 0) {
    remaining[0].values.forEach(row => {
      console.log(`  id=${row[0]}, type="${row[1]}", content="${row[2]}"`);
    });
  } else {
    console.log('  无记录');
  }

  saveDatabase();
  console.log('\n数据库已保存');

  process.exit(0);
})();
