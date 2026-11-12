const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xueqing-crm-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * JWT 认证中间件
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未登录或token无效' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'token已过期或无效' });
  }
}

/**
 * 生成 JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role, dept: user.dept },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = { authMiddleware, generateToken, JWT_SECRET };
