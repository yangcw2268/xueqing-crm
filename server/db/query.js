const { getDb, saveDatabase } = require('./init');

/**
 * 查询多条记录
 */
function query(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * 查询单条记录
 */
function queryOne(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

/**
 * 执行 SQL（INSERT/UPDATE/DELETE/CREATE）
 */
function run(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  // 获取最后插入的行 ID
  const idStmt = db.prepare('SELECT last_insert_rowid() as id');
  idStmt.step();
  const lastId = idStmt.getAsObject().id;
  idStmt.free();
  stmt.free();
  saveDatabase();
  return lastId;
}

/**
 * 执行批量 SQL
 */
function exec(sql) {
  const db = getDb();
  db.exec(sql);
  saveDatabase();
}

module.exports = { query, queryOne, run, exec };
