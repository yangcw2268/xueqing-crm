const { getDb } = require('../db/init');

/**
 * 自动记录操作日志中间件
 * 记录所有写操作（POST/PUT/DELETE）到 audit_logs 表
 */
function auditLogMiddleware(req, res, next) {
  // 只记录写操作
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  // 忽略路径（这些路由有自己的审计日志逻辑或不需要记录）
  if (/\/contacts\//.test(req.path)) return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // 在响应返回后记录日志
    if (req.user && req.user.id) {
      try {
        const db = getDb();
        const userId = Number(req.user.id);
        // 从 URL 提取操作类型
        const pathParts = req.path.split('/').filter(Boolean);
        const target = pathParts[0] || '-';
        const actionType = `${req.method} ${req.path}`;
        const detail = body?.message || body?.data ? JSON.stringify(body) : '';

        if (!isNaN(userId) && userId > 0) {
          const stmt = db.prepare(
            'INSERT INTO audit_logs (user_id, action_type, target, detail) VALUES (?, ?, ?, ?)'
          );
          stmt.run(userId, actionType, target, detail || null);
        }

        // 保存数据库
        const { saveDatabase } = require('../db/init');
        saveDatabase();
      } catch (err) {
        console.error('审计日志记录失败:', err.message);
      }
    }
    return originalJson(body);
  };

  next();
}

module.exports = { auditLogMiddleware };
