const express = require('express');
const { query, queryOne, run } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const FEISHU_CONFIG = require('../config/feishu');
const router = express.Router();

router.use(authMiddleware);

// GET /api/users - 获取用户列表
// 状态值转换工具函数
function statusToChinese(en) {
  if (en === 'active') return '启用';
  if (en === 'disabled') return '停用';
  return en;
}
function statusToEnglish(cn) {
  if (cn === '启用') return 'active';
  if (cn === '停用') return 'disabled';
  return cn;
}

router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT id, name, role, dept, phone, email, feishu_open_id, allow_password_login, source, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (req.query.dept) {
      sql += ' AND dept = ?';
      params.push(req.query.dept);
    }
    if (req.query.role) {
      sql += ' AND role = ?';
      params.push(req.query.role);
    }
    if (req.query.status) {
      sql += ' AND status = ?';
      params.push(req.query.status);
    }

    const users = await query(sql, params);
    const data = users;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users - 创建用户
router.post('/', async (req, res) => {
  try {
    const { name, password, role, dept, phone, email, status, allow_password_login } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const dbStatus = status || '启用';
    const allowPwd = allow_password_login ? 1 : 0;
    const result = await run(
      'INSERT INTO users (name, password, role, dept, phone, email, status, allow_password_login, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'manual\', datetime(\'now\'))',
      [name, hashedPassword, role, dept, phone, email, dbStatus, allowPwd]
    );
    res.json({ success: true, data: { id: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/import - 批量导入账号（必须在 /:id 路由之前）
const multer = require('multer');
const XLSX = require('xlsx');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传文件' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // 跳过表头，从第二行开始
    const dataRows = rows.slice(1);
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const name = row[0] ? String(row[0]).trim() : '';
      const phone = row[1] ? String(row[1]).trim() : '';
      const email = row[2] ? String(row[2]).trim() : '';
      const dept = row[3] ? String(row[3]).trim() : '';
      const role = row[4] ? String(row[4]).trim() : '员工';

      if (!name) {
        errorCount++;
        errors.push(`第 ${i + 2} 行：姓名为空，跳过`);
        continue;
      }

      try {
        // 检查手机号是否已存在
        if (phone) {
          const existing = await query('SELECT id FROM users WHERE phone = ?', [phone]);
          if (existing.length > 0) {
            skipCount++;
            continue;
          }
        }

        // 检查邮箱是否已存在
        if (email) {
          const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
          if (existing.length > 0) {
            skipCount++;
            continue;
          }
        }

        const importStatus = '启用';
        await run(
          'INSERT INTO users (name, password, role, dept, phone, email, status, allow_password_login, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, \'import\', datetime(\'now\'))',
          [name, hashedPassword, role, dept, phone, email, importStatus]
        );
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`第 ${i + 2} 行：${err.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        total: dataRows.length,
        success_count: successCount,
        skip_count: skipCount,
        error_count: errorCount,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== 飞书通讯录同步（必须在 /:id 路由之前） ==========

// 获取飞书 tenant_access_token
async function getFeishuTenantAccessToken() {
  console.log('[飞书] 获取 tenant_access_token, app_id:', FEISHU_CONFIG.appId);
  const response = await fetch(`${FEISHU_CONFIG.apiBaseUrl}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: FEISHU_CONFIG.appId,
      app_secret: FEISHU_CONFIG.appSecret
    })
  });
  const data = await response.json();
  console.log('[飞书] tenant_access_token 响应:', JSON.stringify(data));
  if (data.code !== 0) {
    throw new Error(`获取tenant_access_token失败: ${data.msg}`);
  }
  return data.tenant_access_token;
}

// 递归展开飞书部门嵌套结构
// 注意：飞书API fetch_child=true 返回的嵌套子部门可能没有正确的 parent_id，
// 需要递归时传递真实父级ID来修正
function flattenDepartments(departments, result = [], parentId = null) {
  for (const dept of departments) {
    // 使用传递的 parentId，若为空则使用部门自身的 parent_id
    const actualParentId = parentId !== null ? parentId : dept.parent_id;
    result.push({ id: dept.open_department_id, name: dept.name, parent_id: actualParentId });
    // 飞书API fetch_child=true 返回的子部门可能在 children 或 child_items 中
    const children = dept.children || dept.child_items || dept.child_departments || [];
    if (children.length > 0) {
      flattenDepartments(children, result, dept.open_department_id);
    }
  }
  return result;
}

// 获取飞书部门列表
async function fetchFeishuDepartments(tenantAccessToken) {
  const allDepartments = [];
  let pageToken = '';
  let hasNext = true;

  while (hasNext) {
    let url = `${FEISHU_CONFIG.apiBaseUrl}/contact/v3/departments/0/children?fetch_child=true&page_size=50`;
    if (pageToken) {
      url += `&page_token=${pageToken}`;
    }
    console.log('[飞书] 请求部门列表 URL:', url);
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${tenantAccessToken}` }
    });
    const data = await response.json();
    console.log('[飞书] 部门列表响应:', JSON.stringify(data));
    if (data.code !== 0) {
      throw new Error(`获取部门列表失败: ${data.msg}`);
    }
    if (data.data && data.data.items) {
      // 递归展开嵌套的子部门
      allDepartments.push(...flattenDepartments(data.data.items));
    }
    hasNext = data.data.has_more;
    pageToken = data.data.page_token || '';
  }

  console.log('[飞书] 部门列表结果总数:', allDepartments.length);

  // 筛选一级部门（parent_id 为 0 或空）
  const topLevelDepartments = allDepartments.filter(d => !d.parent_id || d.parent_id === '0' || d.parent_id === 0);
  console.log('[飞书] 一级部门数量:', topLevelDepartments.length);

  return { all: allDepartments, topLevel: topLevelDepartments };
}

// 获取飞书通讯录用户列表（支持按部门ID过滤）
async function fetchFeishuUsers(tenantAccessToken, departmentIds = null) {
  const allUsers = [];

  // 如果没有指定部门ID，获取全部用户
  if (!departmentIds || departmentIds.length === 0) {
    console.log('[飞书-用户] 未指定部门ID，获取全部用户');
    let pageToken = '';
    let hasNext = true;

    while (hasNext) {
      let url = `${FEISHU_CONFIG.apiBaseUrl}/contact/v3/users?page_size=50`;
      if (pageToken) {
        url += `&page_token=${pageToken}`;
      }
      console.log('[飞书-用户] 请求URL:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${tenantAccessToken}` }
      });
      const data = await response.json();
      console.log('[飞书-用户] 响应code:', data.code, '用户数:', data.data?.users?.length || 0);
      if (data.code !== 0) {
        throw new Error(`获取通讯录失败: ${data.msg}`);
      }
      if (data.data && data.data.users) {
        allUsers.push(...data.data.users);
      }
      hasNext = data.data.has_more;
      pageToken = data.data.page_token || '';
    }
  } else {
    // 按部门ID分别拉取用户
    console.log('[飞书-用户] 按部门ID拉取用户, departmentIds:', JSON.stringify(departmentIds));
    const userIdSet = new Set();
    for (const deptId of departmentIds) {
      const deptIdStr = String(deptId);
      console.log('[飞书-用户] 开始拉取部门ID:', deptIdStr, '原始类型:', typeof deptId);
      let pageToken = '';
      let hasNext = true;

      while (hasNext) {
        let url = `${FEISHU_CONFIG.apiBaseUrl}/contact/v3/users?department_id=${deptIdStr}&page_size=50`;
        if (pageToken) {
          url += `&page_token=${pageToken}`;
        }
        console.log('[飞书-用户] 请求URL:', url);
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${tenantAccessToken}` }
        });
        const data = await response.json();
        console.log('[飞书-用户] 部门', deptIdStr, '响应code:', data.code, '用户数:', data.data?.users?.length || 0);
        if (data.code !== 0) {
          throw new Error(`获取部门 ${deptIdStr} 用户失败: ${data.msg}`);
        }
        if (data.data && data.data.users) {
          for (const user of data.data.users) {
            // 去重：同一用户可能属于多个部门
            if (!userIdSet.has(user.user_id)) {
              userIdSet.add(user.user_id);
              allUsers.push(user);
            }
          }
        }
        hasNext = data.data.has_more;
        pageToken = data.data.page_token || '';
      }
    }
  }

  console.log('[飞书-用户] 用户拉取完成, 总计用户数:', allUsers.length);
  return allUsers;
}

// GET /api/users/feishu-departments - 获取飞书一级部门列表（含人数统计）
router.get('/feishu-departments', async (req, res) => {
  try {
    console.log('[飞书] 开始获取部门列表');
    if (FEISHU_CONFIG.appId === 'YOUR_FEISHU_APP_ID') {
      return res.status(400).json({
        success: false,
        message: '请先配置飞书 App ID 和 App Secret'
      });
    }

    const tenantAccessToken = await getFeishuTenantAccessToken();
    console.log('[飞书] token 获取成功, 开始拉取部门列表');
    const { all, topLevel } = await fetchFeishuDepartments(tenantAccessToken);

    // 为每个一级部门统计人数（含子部门）
    const deptData = [];
    for (const dept of topLevel) {
      // 收集该一级部门下所有子部门ID
      const deptIds = all.filter(d => {
        // 检查该部门是否在当前一级部门下
        let current = d;
        let isUnder = false;
        // 通过遍历所有部门找父级链
        const parentId = d.parent_id;
        if (!parentId || parentId === '0' || parentId === 0) {
          isUnder = (d.id === dept.id);
        } else {
          // 向上查找直到找到一级父部门
          let foundTopParent = false;
          const checked = new Set();
          let currentParentId = parentId;
          while (currentParentId && checked.size < all.length) {
            checked.add(currentParentId);
            const parent = all.find(p => p.id === currentParentId);
            if (!parent) break;
            if (!parent.parent_id || parent.parent_id === '0' || parent.parent_id === 0) {
              foundTopParent = (parent.id === dept.id);
              break;
            }
            currentParentId = parent.parent_id;
          }
          isUnder = foundTopParent;
        }
        return isUnder;
      }).map(d => d.id);

      // 调用飞书API获取该部门下用户数
      let count = 0;
      try {
        const users = await fetchFeishuUsers(tenantAccessToken, deptIds);
        count = users.length;
      } catch (e) {
        console.error(`[飞书] 统计部门 ${dept.name} 人数失败:`, e.message);
      }

      deptData.push({ id: dept.id, name: dept.name, member_count: count });
    }

    console.log('[飞书] 一级部门列表获取成功, 返回', deptData.length, '个部门');
    res.json({ success: true, data: deptData });
  } catch (err) {
    console.error('[飞书] 获取部门列表错误:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/feishu-sync - 飞书通讯录同步
router.post('/feishu-sync', async (req, res) => {
  try {
    const { department_ids } = req.body;
    console.log('[飞书-同步] 收到请求, department_ids:', JSON.stringify(department_ids));

    // 检查配置
    if (FEISHU_CONFIG.appId === 'YOUR_FEISHU_APP_ID') {
      return res.status(400).json({
        success: false,
        message: '请先配置飞书 App ID 和 App Secret'
      });
    }

    const tenantAccessToken = await getFeishuTenantAccessToken();
    console.log('[飞书-同步] tenantAccessToken 获取成功');

    // 获取全部部门用于构建一级部门映射
    const { all: allDepartments } = await fetchFeishuDepartments(tenantAccessToken);
    console.log('[飞书-同步] 获取到部门数:', allDepartments.length);
    const deptParentMap = {};
    const topLevelDeptIds = new Set();
    for (const d of allDepartments) {
      deptParentMap[d.id] = d.parent_id;
      if (!d.parent_id || d.parent_id === '0' || d.parent_id === 0) {
        topLevelDeptIds.add(d.id);
      }
    }
    const topLevelNameMap = {};
    for (const d of allDepartments) {
      if (topLevelDeptIds.has(d.id)) {
        topLevelNameMap[d.id] = d.name;
      }
    }
    // 为每个部门ID找到对应的一级部门ID
    const deptTopLevelIdMap = {};
    for (const d of allDepartments) {
      let currentId = d.id;
      while (currentId && !topLevelDeptIds.has(currentId)) {
        currentId = deptParentMap[currentId];
      }
      if (currentId) {
        deptTopLevelIdMap[d.id] = currentId;
      }
    }
    // 根据 ent_simple_info 获取一级部门名称
    function getTopLevelDeptName(info) {
      if (!info || !info[0]) return '';
      const firstDeptId = String(info[0].dept_id);
      if (topLevelDeptIds.has(firstDeptId)) return topLevelNameMap[firstDeptId] || '';
      const topLevelId = deptTopLevelIdMap[firstDeptId];
      return topLevelId ? (topLevelNameMap[topLevelId] || '') : (info[0].dept_name || '');
    }

    const feishuUsers = await fetchFeishuUsers(tenantAccessToken, department_ids);
    console.log('[飞书-同步] 获取到飞书用户数:', feishuUsers.length);

    let added = 0;
    let updated = 0;
    let disabled = 0;
    const errors = [];

    // 获取系统现有用户
    const existingUsers = await query('SELECT * FROM users');
    console.log('[飞书-同步] 系统现有用户数:', existingUsers.length);
    const feishuUserIds = new Set(feishuUsers.map(u => u.user_id));

    for (const feishuUser of feishuUsers) {
      try {
        const { user_id, name, email, phone, ent_simple_info, employee_type } = feishuUser;
        const isDeparted = feishuUser.status_key === 'disabled' || employee_type === 2;
        const dept = getTopLevelDeptName(ent_simple_info);

        // 查找系统用户（按 feishu_open_id 或手机号）
        let systemUser = queryOne('SELECT * FROM users WHERE feishu_open_id = ?', [user_id]);
        if (!systemUser && phone) {
          systemUser = queryOne('SELECT * FROM users WHERE phone = ?', [phone]);
        }

        if (systemUser) {
          // 更新已有用户
          run(`UPDATE users SET 
            feishu_open_id = ?, 
            feishu_avatar = ?, 
            feishu_sync_status = ?, 
            dept = ?,
            email = ?,
            status = ?, 
            updated_at = datetime('now') 
            WHERE id = ?`,
            [user_id, feishuUser.avatar_url || systemUser.feishu_avatar, 'synced', dept, email || systemUser.email || '', isDeparted ? '禁用' : '启用', systemUser.id]
          );
          updated++;
        } else if (!isDeparted) {
          // 新增用户（默认角色为空，密码默认 123456）
          const bcrypt = require('bcryptjs');
          const hashedPassword = await bcrypt.hash('123456', 10);
          await run(`INSERT INTO users (name, password, role, dept, phone, email, feishu_open_id, feishu_avatar, feishu_sync_status, status, allow_password_login, source, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'feishu', datetime('now'))`,
            [name || '未知用户', hashedPassword, '', dept, phone, email || '', user_id, feishuUser.avatar_url || '', 'synced', '启用']
          );
          added++;
        }
      } catch (err) {
        console.error('[飞书-同步] 处理用户失败:', feishuUser.name, err.message);
        errors.push(`处理用户 ${feishuUser.name} 失败: ${err.message}`);
      }
    }
    console.log('[飞书-同步] 用户处理完成 - 新增:', added, '更新:', updated);

    // 处理飞书已离职但系统未停用的用户
    console.log('[飞书-同步] 开始检查离职用户...');
    for (const systemUser of existingUsers) {
      if (systemUser.feishu_open_id && !feishuUserIds.has(systemUser.feishu_open_id)) {
        // 该用户在飞书通讯录中不存在，标记为停用
        run(`UPDATE users SET status = '禁用', feishu_sync_status = 'left_company', updated_at = datetime('now') WHERE id = ?`,
          [systemUser.id]
        );
        disabled++;
      }
    }

    res.json({
      success: true,
      message: `同步完成：新增 ${added} 人，更新 ${updated} 人，停用 ${disabled} 人`,
      data: { added, updated, disabled, errors, total: feishuUsers.length }
    });
  } catch (err) {
    console.error('[飞书-同步] 顶层错误:', err.message);
    console.error('[飞书-同步] 错误堆栈:', err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id - 更新用户
router.put('/:id', async (req, res) => {
  try {
    const { name, role, dept, phone, email, status, allow_password_login } = req.body;
    const updates = [];
    const params = [];
    // 将中文状态值转换为英文
    const dbStatus = status;
    const fields = { name, role, dept, phone, email, status: dbStatus };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    // allow_password_login 需要单独处理（布尔转 0/1）
    if (allow_password_login !== undefined) {
      updates.push(`allow_password_login = ?`);
      params.push(allow_password_login ? 1 : 0);
    }
    if (updates.length === 0) return res.json({ success: true });
    params.push(req.params.id);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id - 删除用户
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/password - 修改用户密码
router.put('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    await run('UPDATE users SET password = ?, updated_at = datetime(\'now\') WHERE id = ?', [hashedPassword, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== 学校字典管理 ==========

// GET /api/school_dict - 获取学校字典
router.get('/school_dict', async (req, res) => {
  try {
    const dicts = await query('SELECT * FROM school_dict ORDER BY sort_order, id');
    res.json({ success: true, data: dicts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/school_dict - 创建学校字典
router.post('/school_dict', async (req, res) => {
  try {
    const { category, key, value, sort_order, status } = req.body;
    await run('INSERT INTO school_dict (category, key, value, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      [category, key, value, sort_order || 0, status || '启用']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/school_dict/:id - 更新学校字典
router.put('/school_dict/:id', async (req, res) => {
  try {
    const { category, key, value, sort_order, status } = req.body;
    const updates = [];
    const params = [];
    const fields = { category, key, value, sort_order, status };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) {
        updates.push(`${k} = ?`);
        params.push(v);
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

// DELETE /api/school_dict/:id - 删除学校字典
router.delete('/school_dict/:id', async (req, res) => {
  try {
    await run('DELETE FROM school_dict WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
