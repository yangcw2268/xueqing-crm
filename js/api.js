// API 请求工具
const API = {
  base: '',

  // 获取 token
  getToken() {
    return localStorage.getItem('token');
  },

  // 获取当前用户
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 通用请求方法
  async request(url, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    let response;
    try {
      response = await fetch(`${this.base}${url}`, config);
    } catch (fetchError) {
      // 网络错误：服务器未启动、CORS、连接失败等
      throw new Error(`请求失败：无法连接到服务器 (${this.base}${url})。请检查服务器是否运行在 http://localhost:3000`);
    }

    // 401 未授权，跳转登录
    if (response.status === 401) {
      this.logout();
      return null;
    }

    // 非 2xx 响应，尝试读取错误信息
    if (!response.ok) {
      let errorMsg = `服务器返回错误 (${response.status})`;
      try {
        const errorResult = await response.json();
        if (errorResult && errorResult.message) {
          errorMsg = errorResult.message;
        }
        // 返回错误结构，让调用方处理
        return { success: false, message: errorMsg, status: response.status };
      } catch (e) {
        // 非JSON响应
        try {
          const text = await response.text();
          if (text) errorMsg += `: ${text.substring(0, 100)}`;
        } catch (textErr) {
          // ignore
        }
        return { success: false, message: errorMsg, status: response.status };
      }
    }

    // 尝试解析JSON，失败则返回原始文本
    try {
      const result = await response.json();
      return result;
    } catch (jsonError) {
      const text = await response.text();
      return { success: false, message: `服务器返回格式错误: ${text.substring(0, 100)}` };
    }
  },

  async get(url) {
    return this.request(url, { method: 'GET' });
  },

  async post(url, body) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(url, body) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(url) {
    return this.request(url, { method: 'DELETE' });
  },

  // 学校导出（二进制文件下载）
  async exportSchools(params = {}) {
    const token = this.getToken();
    const qs = new URLSearchParams(params).toString();
    const url = `/api/schools/export${qs ? '?' + qs : ''}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      let msg = `导出失败 (${resp.status})`;
      try {
        const e = await resp.json();
        if (e && e.message) msg = e.message;
      } catch (_) { /* ignore */ }
      throw new Error(msg);
    }
    // 从 Content-Disposition 读取文件名
    const cd = resp.headers.get('Content-Disposition') || '';
    const match = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    let filename = '学校列表.xlsx';
    if (match) {
      try { filename = decodeURIComponent(match[1].replace(/"/g, '')); } catch (_) { filename = match[1]; }
    }
    const blob = await resp.blob();
    return { blob, filename };
  },

  // 认证相关
  async login(name, password) {
    return this.post('/api/auth/login', { name, password });
  },

  async getUserinfo() {
    return this.get('/api/auth/userinfo');
  },

  async logout() {
    // 先尝试调用后端登出
    this.post('/api/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  },

  // 学校相关
  async getSchools(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/schools${qs ? '?' + qs : ''}`);
  },

  async getSchool(id) {
    return this.get(`/api/schools/${id}`);
  },

  async createSchool(body) {
    return this.post('/api/schools', body);
  },

  async updateSchool(id, body) {
    return this.put(`/api/schools/${id}`, body);
  },

  async deleteSchool(id) {
    return this.delete(`/api/schools/${id}`);
  },

  async getSchoolStats() {
    return this.get('/api/schools/stats');
  },

  // 学校状态流转
  async advanceSchool(id) {
    return this.post(`/api/schools/${id}/advance`, {});
  },

  async pauseSchool(id) {
    return this.post(`/api/schools/${id}/pause`, {});
  },

  async resumeSchool(id) {
    return this.post(`/api/schools/${id}/resume`, {});
  },

  async terminateSchool(id) {
    return this.post(`/api/schools/${id}/terminate`, {});
  },

  // 联系人相关
  async getContacts(schoolId) {
    return this.get(`/api/schools/${schoolId}/contacts`);
  },

  async createContact(schoolId, body) {
    return this.post(`/api/schools/${schoolId}/contacts`, body);
  },

  async updateContact(schoolId, contactId, body) {
    return this.request(`/api/schools/${schoolId}/contacts/${contactId}`, {
      method: 'PUT',
      json: body,
    });
  },

  async deleteContact(schoolId, contactId) {
    return this.delete(`/api/schools/${schoolId}/contacts/${contactId}`);
  },

  // Dashboard 相关
  async getEmployeeDashboard() {
    return this.get('/api/dashboard/employee');
  },

  async getWeekPlan() {
    return this.get('/api/dashboard/week-plan');
  },

  // 统计相关
  async getEmployeeStats() {
    return this.get('/api/stats/employee');
  },

  // 记录相关
  async getRecords(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/records${qs ? '?' + qs : ''}`);
  },

  // 工作记录（按学校过滤，用于学校详情页时间线）
  async getWorkRecords(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/work-records${qs ? '?' + qs : ''}`);
  },

  async createWorkRecord(body) {
    return this.post('/api/work-records', body);
  },
  async updateWorkRecord(id, body) {
    return this.put(`/api/work-records/${id}`, body);
  },

  async getContracts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/records/contracts${qs ? '?' + qs : ''}`);
  },

  async createContract(body) {
    return this.post('/api/records/contracts', body);
  },

  async getDevicePlacements(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/records/device_placements${qs ? '?' + qs : ''}`);
  },

  async createDevicePlacement(body) {
    return this.post('/api/records/device_placements', body);
  },


  // 用户相关
  async getUsers() {
    return this.get('/api/users');
  },

  async createUser(body) {
    return this.post('/api/users', body);
  },

  async updateUser(id, body) {
    return this.put(`/api/users/${id}`, body);
  },

  async updateUserPassword(id, password) {
    return this.put(`/api/users/${id}/password`, { password });
  },

  async deleteUser(id) {
    return this.delete(`/api/users/${id}`);
  },

  // 飞书通讯录同步
  async getFeishuDepartments() {
    return this.get('/api/users/feishu-departments');
  },

  async syncFeishuContacts(departmentIds = []) {
    return this.post('/api/users/feishu-sync', { department_ids: departmentIds });
  },

  // 学校字典
  async getSchoolDict() {
    return this.get('/api/school-dict');
  },

  async createSchoolDict(body) {
    return this.post('/api/school-dict', body);
  },

  async updateSchoolDict(id, body) {
    return this.put(`/api/school-dict/${id}`, body);
  },

  async deleteSchoolDict(id) {
    return this.delete(`/api/school-dict/${id}`);
  },

  // 操作日志相关
  async getAuditLogs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/audit-logs${qs ? '?' + qs : ''}`);
  },

  async createAuditLog(body) {
    return this.post('/api/audit-logs', body);
  },

  // 数据管理相关
  async getDataManagement(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/data-management${qs ? '?' + qs : ''}`);
  },

  async createDataManagement(body) {
    return this.post('/api/data-management', body);
  },

  // 下载导入模板
  getImportTemplateUrl(type) {
    return `/api/data-management/template/${type}`;
  },

  // 下载导入模板（携带登录 token，避免直接跳转导致 401）
  async downloadImportTemplate(type, filename) {
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.base}${this.getImportTemplateUrl(type)}`, { headers });
    if (!response.ok) {
      if (response.status === 401) this.logout();
      throw new Error('模板下载失败');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || '导入模板.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // 文件上传导入
  async uploadImport(endpoint, file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.base}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      this.logout();
      return null;
    }

    return response.json();
  },

  // 学校详情页 Tab 数据
  async getSchoolWorkRecords(schoolId) {
    return this.get(`/api/work-records?school_id=${schoolId}`);
  },

  async getSchoolContracts(schoolId) {
    return this.get(`/api/contracts?school_id=${schoolId}`);
  },

  async getSchoolDevicePlacements(schoolId) {
    return this.get(`/api/device-placements?school_id=${schoolId}`);
  },

  async createDevicePlacement(body) {
    return this.post('/api/device-placements', body);
  },

  async getSchoolLogs(schoolId) {
    return this.get(`/api/logs?school_id=${schoolId}`);
  },

  // 操作日志页面 - 获取所有日志
  async getOperationLogs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/logs${qs ? '?' + qs : ''}`);
  },

  // ========== 工作汇报相关 ==========
  async getWorkReports(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/work-reports${qs ? '?' + qs : ''}`);
  },

  async getWorkReport(id) {
    return this.get(`/api/work-reports/${id}`);
  },

  async createWorkReport(body) {
    return this.post('/api/work-reports', body);
  },

  async updateWorkReport(id, body) {
    return this.put(`/api/work-reports/${id}`, body);
  },

  async submitWorkReport(id, body) {
    return this.put(`/api/work-reports/${id}/submit`, body);
  },

  async deleteWorkReport(id) {
    return this.delete(`/api/work-reports/${id}`);
  },

  async getWorkReportFollowRecords(id) {
    return this.get(`/api/work-reports/${id}/follow-records`);
  },

  async getWorkReportCurrentPeriod(reportType) {
    return this.get(`/api/work-reports/current-period?reportType=${encodeURIComponent(reportType)}`);
  },

  // 月度目标相关
  async getMonthlyGoals() {
    return this.get('/api/work-reports/monthly-goals');
  },

  async getMonthlyGoal(month) {
    return this.get(`/api/work-reports/monthly-goals/${encodeURIComponent(month)}`);
  },

  async saveMonthlyGoal(body) {
    return this.post('/api/work-reports/monthly-goals', body);
  },

  async deleteMonthlyGoal(month) {
    return this.delete(`/api/work-reports/monthly-goals/${encodeURIComponent(month)}`);
  },
};

// 登录检查
function requireAuth() {
  const token = API.getToken();
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  // 检查 JWT 是否过期（解析 payload 中的 exp 字段）
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('invalid token');
    // base64url → base64
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // token 已过期，清除并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
      return false;
    }
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
    return false;
  }
  return true;
}
