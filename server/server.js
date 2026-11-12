const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./db/init');
const { auditLogMiddleware } = require('./middleware/audit-log');

// 文件日志：将 console 输出同时写入 server.log
const LOG_FILE = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
const origLog = console.log;
const origError = console.error;
console.log = function(...args) {
  const line = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
  logStream.write(`[${new Date().toISOString()}] LOG: ${line}`);
  origLog.apply(console, args);
};
console.error = function(...args) {
  const line = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
  logStream.write(`[${new Date().toISOString()}] ERR: ${line}`);
  origError.apply(console, args);
};

const authRoutes = require('./routes/auth');
const schoolsRoutes = require('./routes/schools');
const dashboardRoutes = require('./routes/dashboard');
const recordsRoutes = require('./routes/records');
const aliasesRoutes = require('./routes/aliases');
const usersRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const importRoutes = require('./routes/import');
const schoolDictRoutes = require('./routes/school-dict');
const logsRoutes = require('./routes/logs');
const statsRoutes = require('./routes/stats');
const workReportsRoutes = require('./routes/work-reports');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/..'));
// 自动操作日志中间件（全局）
app.use(auditLogMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/dashboard', dashboardRoutes);
// 健康检查（必须在 /api 别名路由之前，否则会被 authMiddleware 拦截）
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});
// 别名路由（连字符格式）放在 records 之前，避免被 /:id 匹配
app.use('/api', aliasesRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/data-management', importRoutes);
app.use('/api/school-dict', schoolDictRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/work-reports', workReportsRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
