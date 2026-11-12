const express = require('express');
const bcrypt = require('bcryptjs');
const https = require('https');
const { URL } = require('url');
const { queryOne, run } = require('../db/query');
const { authMiddleware, generateToken } = require('../middleware/auth');
const FEISHU_CONFIG = require('../config/feishu');

const router = express.Router();

// Simple in-memory token blacklist (for logout)
const tokenBlacklist = new Set();

/**
 * 通用 HTTPS POST helper (兼容 Node.js 16)
 */
function httpsPost(urlString, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const postData = JSON.stringify(body);
    const headers = { 'Content-Type': 'application/json', ...extraHeaders };
    const req = https.request(urlString, {
      method: 'POST',
      headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, text: () => data, json: () => JSON.parse(data) });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 通用 HTTPS GET helper (兼容 Node.js 16)
 */
function httpsGet(urlString, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlString, {
      headers: extraHeaders
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, text: () => data, json: () => JSON.parse(data) });
      });
    });
    req.on('error', reject);
  });
}

/**
 * 获取飞书应用 tenant_access_token
 */
async function getTenantAccessToken() {
  const url = `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.tenantAccessTokenUrl}`;
  const body = {
    app_id: FEISHU_CONFIG.appId,
    app_secret: FEISHU_CONFIG.appSecret
  };
  console.log('[飞书登录] 请求 tenant_access_token URL:', url);

  const response = await httpsPost(url, body);
  const data = await response.json();
  console.log('[飞书登录] tenant_access_token 响应:', JSON.stringify(data));

  if (data.code !== 0) {
    throw new Error(`获取tenant_access_token失败: ${data.msg} (code: ${data.code})`);
  }
  return data.tenant_access_token;
}

/**
 * 获取飞书用户访问令牌
 */
async function getFeishuUserAccessToken(code) {
  // 先获取 tenant_access_token
  console.log('[飞书登录] 步骤1.1：获取 tenant_access_token...');
  const tenantAccessToken = await getTenantAccessToken();
  console.log('[飞书登录] 步骤1.1：tenant_access_token 获取成功');

  const url = `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.oauthTokenUrl}`;
  const body = {
    grant_type: 'authorization_code',
    code
  };
  console.log('[飞书登录] 请求 user_access_token URL:', url);
  console.log('[飞书登录] 请求 user_access_token Body:', JSON.stringify(body));

  const response = await httpsPost(url, body, {
    'Authorization': `Bearer ${tenantAccessToken}`
  });
  const rawText = await response.text();
  console.log('[飞书登录] token 原始响应状态:', response.status);
  console.log('[飞书登录] token 原始响应内容:', rawText);
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error('[飞书登录] JSON解析失败:', e.message);
    throw new Error(`飞书API响应格式异常: ${rawText.substring(0, 200)}`);
  }
  console.log('[飞书登录] token 响应:', JSON.stringify(data));

  if (data.code !== 0) {
    throw new Error(`获取user_access_token失败: ${data.msg} (code: ${data.code})`);
  }
  return data.data.access_token;
}

/**
 * 获取飞书用户信息
 */
async function getFeishuUserInfo(accessToken) {
  const url = `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.oauthUserInfoUrl}`;
  console.log('[飞书登录] 请求用户信息 URL:', url);

  const response = await httpsGet(url, {
    'Authorization': `Bearer ${accessToken}`
  });
  const data = await response.json();
  console.log('[飞书登录] 用户信息响应:', JSON.stringify(data));

  if (data.code !== 0) {
    throw new Error(`获取用户信息失败: ${data.msg} (code: ${data.code})`);
  }
  return data.data;
}

/**
 * GET /api/auth/feishu/redirect
 * 返回飞书授权URL，前端跳转该URL完成授权
 */
router.get('/feishu/redirect', (req, res) => {
  const state = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const authUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${FEISHU_CONFIG.appId}&redirect_uri=${encodeURIComponent(FEISHU_CONFIG.redirectUri)}&state=${state}`;
  res.json({
    success: true,
    data: { authUrl }
  });
});

/**
 * GET /api/auth/feishu/callback
 * 飞书OAuth回调，处理授权码登录
 */
async function feishuCallbackHandler(req, res) {
  const { code, state } = req.query;

  console.log('[飞书登录] 收到回调，code:', code);

  if (!code) {
    console.log('[飞书登录] 授权失败：未收到code，完整参数:', req.query);
    return res.redirect('/login.html?error=授权失败，请重试');
  }

  try {
    // 1. 用code换取user_access_token
    console.log('[飞书登录] 步骤1：换取 user_access_token...');
    const accessToken = await getFeishuUserAccessToken(code);
    console.log('[飞书登录] 步骤1：获取 user_access_token 成功');

    // 2. 获取用户信息
    console.log('[飞书登录] 步骤2：获取飞书用户信息...');
    const userInfo = await getFeishuUserInfo(accessToken);
    const feishuOpenId = userInfo.open_id;
    console.log('[飞书登录] 步骤2：用户信息:', JSON.stringify({ user_id: feishuOpenId, name: userInfo.name, phone: userInfo.mobile }));

    // 3. 根据飞书open_id匹配用户
    console.log('[飞书登录] 步骤3：根据 feishu_open_id 匹配用户:', feishuOpenId);
    let user = queryOne("SELECT * FROM users WHERE feishu_open_id = ? AND status = '启用'", [feishuOpenId]);

    // 4. 如果未匹配到，尝试根据手机号匹配（如果飞书返回了手机号）
    if (!user && userInfo.mobile) {
      // 去除飞书手机号可能带的前缀 +86、+、空格等，只保留纯数字
      const feishuPhone = userInfo.mobile.replace(/^(\+86|\+|[\s-])+/g, '').trim();
      console.log('[飞书登录] 步骤4：feishu_open_id 未匹配，尝试按手机号匹配。飞书原始手机号:', userInfo.mobile, '处理后:', feishuPhone);
      // 匹配数据库手机号：精确匹配处理后号码
      user = queryOne("SELECT * FROM users WHERE phone = ? AND status = '启用'", [feishuPhone]);
      // 如果精确匹配失败，再尝试匹配数据库中带前缀的号码
      if (!user) {
        user = queryOne("SELECT * FROM users WHERE REPLACE(REPLACE(REPLACE(phone, '+86', ''), '+', ''), ' ', '') = ? AND status = '启用'", [feishuPhone]);
      }
      // 更新用户的飞书open_id
      if (user) {
        run('UPDATE users SET feishu_open_id = ?, updated_at = datetime(\'now\') WHERE id = ?', [feishuOpenId, user.id]);
        console.log('[飞书登录] 步骤4：手机号匹配成功，用户:', user.name, '数据库手机号:', user.phone);
      }
    }

    // 4.5. 如果仍未匹配到，尝试根据邮箱匹配（如果飞书返回了邮箱）
    if (!user && userInfo.email) {
      // 邮箱不区分大小写匹配
      console.log('[飞书登录] 步骤4.5：手机号未匹配，尝试按邮箱匹配:', userInfo.email);
      user = queryOne("SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND status = '启用'", [userInfo.email]);
      // 更新用户的飞书open_id
      if (user) {
        run('UPDATE users SET feishu_open_id = ?, updated_at = datetime(\'now\') WHERE id = ?', [feishuOpenId, user.id]);
        console.log('[飞书登录] 步骤4.5：邮箱匹配成功，用户:', user.name, '数据库邮箱:', user.email);
      }
    }

    // 5. 如果仍未匹配到，提示联系管理员
    if (!user) {
      console.log('[飞书登录] 步骤5：未找到关联用户，feishu_open_id:', feishuOpenId, 'mobile:', userInfo.mobile, 'email:', userInfo.email);
      return res.redirect(`/login.html?error=未找到关联的账户，请联系管理员绑定飞书账号`);
    }

    // 6. 生成JWT token
    console.log('[飞书登录] 步骤6：生成 JWT token，用户:', user.name);
    const token = generateToken(user);

    // 7. 跳转到主页并携带token
    console.log('[飞书登录] 登录成功，用户:', user.name);
    res.redirect(`/index.html?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('[飞书登录] 异常:', error.message);
    res.redirect('/login.html?error=飞书登录失败，请重试');
  }
}
router.get('/feishu/callback', feishuCallbackHandler);
router.get('/feishu/callback/', feishuCallbackHandler);

/**
 * 角色菜单定义
 * 每个菜单项: { id, name, icon, group, view, order }
 */
const ROLE_MENUS = {
  '员工': [
    { id: 'dashboard', name: '工作台', group: '工作台', view: 'dashboard', order: 1 },
    { id: 'schoolList', name: '学校管理', group: '业务管理', view: 'schoolList', order: 2 },
    { id: 'workRecords', name: '工作记录', group: '业务管理', view: 'records', order: 3 },
    { id: 'workReportsList', name: '工作管理', group: '业务管理', view: 'workReportsList', order: 4 },
  ],
  '一级部门负责人': [
    { id: 'dashboard', name: '工作台', group: '工作台', view: 'dashboard', order: 1 },
    { id: 'schoolList', name: '学校管理', group: '业务管理', view: 'schoolList', order: 2 },
    { id: 'workRecords', name: '工作记录', group: '业务管理', view: 'records', order: 3 },
    { id: 'workReportsList', name: '工作管理', group: '业务管理', view: 'workReportsList', order: 4 },
    { id: 'users', name: '账户管理', group: '系统管理', view: 'users', order: 5 },
    { id: 'dataManagement', name: '数据管理', group: '系统管理', view: 'dataManagement', order: 6 },
    { id: 'operationLogs', name: '操作日志', group: '系统管理', view: 'operationLogs', order: 7 },
    { id: 'schoolDictionary', name: '学校字典', group: '系统管理', view: 'schoolDictionary', order: 8 },
  ],
  '超级管理员': [
    { id: 'dashboard', name: '工作台', group: '工作台', view: 'dashboard', order: 1 },
    { id: 'schoolList', name: '学校管理', group: '业务管理', view: 'schoolList', order: 2 },
    { id: 'workRecords', name: '工作记录', group: '业务管理', view: 'records', order: 3 },
    { id: 'workReportsList', name: '工作管理', group: '业务管理', view: 'workReportsList', order: 4 },
    { id: 'users', name: '账户管理', group: '系统管理', view: 'users', order: 5 },
    { id: 'dataManagement', name: '数据管理', group: '系统管理', view: 'dataManagement', order: 6 },
    { id: 'operationLogs', name: '操作日志', group: '系统管理', view: 'operationLogs', order: 7 },
    { id: 'schoolDictionary', name: '学校字典', group: '系统管理', view: 'schoolDictionary', order: 8 },
  ],
};

/**
 * 根据角色获取菜单列表
 */
function getMenusByRole(role) {
  return ROLE_MENUS[role] || [];
}

/**
 * POST /api/auth/login
 * Body: { name, password }
 */
router.post('/login', (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  const user = queryOne('SELECT * FROM users WHERE name = ?', [name]);
  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  if (user.status === '禁用') {
    return res.status(403).json({ success: false, message: '账户已禁用' });
  }

  // 检查密码登录开关
  if (!user.allow_password_login) {
    return res.status(403).json({ success: false, message: '该账号未开放密码登录，请使用飞书登录' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        dept: user.dept,
        phone: user.phone,
        email: user.email,
        menus: getMenusByRole(user.role),
      }
    }
  });
});

/**
 * GET /api/auth/userinfo
 * Headers: Authorization: Bearer <token>
 */
router.get('/userinfo', authMiddleware, (req, res) => {
  const user = queryOne(
    'SELECT id, name, role, dept, phone, email, status FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  res.json({
    success: true,
    data: {
      ...user,
      menus: getMenusByRole(user.role),
    }
  });
});

/**
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  tokenBlacklist.add(token);

  res.json({
    success: true,
    message: '退出登录成功'
  });
});

module.exports = router;
