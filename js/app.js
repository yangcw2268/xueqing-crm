/* ==================== Mock Data ==================== */

const mockData = {
  // Sales dashboard
  salesStats: {
    pendingContact: 12,
    pendingContract: 8,
    pendingPayment: 5
  },

  overdueWarnings: [
    { name: '光明实验小学', days: 15, desc: '已超过15天未跟进', level: 'red' },
    { name: '希望小学', days: 10, desc: '已超过10天未跟进', level: 'red' },
    { name: '育才中学', days: 5, desc: '超过5天未跟进', level: 'yellow' },
    { name: '蓝天幼儿园', days: 4, desc: '超过4天未跟进', level: 'yellow' },
  ],

  monthlyTargets: [
    { name: '新签学校数', current: 8, target: 10, unit: '所' },
    { name: '新签学生数', current: 320, target: 400, unit: '人' },
    { name: '跟进覆盖率', current: 85, target: 100, unit: '%', isPercent: true },
    { name: '合同回收率', current: 75, target: 100, unit: '%', isPercent: true },
  ],

  recentFollowUps: [
    { school: '阳光小学', time: '2026-10-14 16:30', type: '面谈', content: '与校长沟通新学期设备采购计划，预计11月确定', sales: '张三' },
    { school: '建设路中学', time: '2026-10-14 10:00', type: '电话', content: '确认合同金额，对方同意按原方案执行', sales: '张三' },
    { school: '红星实验小学', time: '2026-10-13 14:00', type: '面谈', content: '提交产品演示，校方表示满意，等待招标', sales: '张三' },
  ],

  // Schools
  schools: [
    { id: 1, name: '阳光小学', status: '方案报价', dept: '华东区', region: '上海市', grade: '小学', sales: '张三', operator: '赵六', lastFollowUp: '2026-10-14' },
    { id: 2, name: '光明实验小学', status: '商务谈判', dept: '华东区', region: '杭州市', grade: '小学', sales: '张三', operator: '赵六', lastFollowUp: '2026-10-13' },
    { id: 3, name: '希望小学', status: '已签约', dept: '华南区', region: '广州市', grade: '小学', sales: '李四', operator: '孙七', lastFollowUp: '2026-10-12' },
    { id: 4, name: '育才中学', status: '服务中', dept: '华南区', region: '深圳市', grade: '初中', sales: '李四', operator: '孙七', lastFollowUp: '2026-10-15' },
    { id: 5, name: '蓝天幼儿园', status: '意向', dept: '华北区', region: '北京市', grade: '幼儿园', sales: '王五', operator: '周八', lastFollowUp: '2026-10-10' },
    { id: 6, name: '建设路中学', status: '商务谈判', dept: '华北区', region: '天津市', grade: '高中', sales: '王五', operator: '周八', lastFollowUp: '2026-10-11' },
    { id: 7, name: '红星实验小学', status: '暂停中', dept: '华东区', region: '南京市', grade: '小学', sales: '张三', operator: '赵六', lastFollowUp: '2026-10-09' },
    { id: 8, name: '未来科技中学', status: '实施中', dept: '华东区', region: '苏州市', grade: '初中', sales: '张三', operator: '赵六', lastFollowUp: '2026-10-15' },
    { id: 9, name: '翠湖小学', status: '已终止', dept: '华南区', region: '东莞市', grade: '小学', sales: '李四', operator: '孙七', lastFollowUp: '2026-10-08' },
    { id: 10, name: '东风路小学', status: '服务中', dept: '华北区', region: '石家庄市', grade: '小学', sales: '王五', operator: '周八', lastFollowUp: '2026-10-14' },
  ],

  // School detail
  schoolDetail: {
    id: 1,
    name: '阳光小学',
    status: '方案报价',
    statusIndex: 2,
    dept: '华东区',
    sales: '张三',
    operator: '赵六',
    contact: '李校长',
    phone: '13800138001',
    address: '上海市浦东新区阳光路100号',
    students: 500,
    grade: '小学',
    createdAt: '2026-09-01',
    firstContactAt: '2026-09-01',
    statusFlow: ['初步接触', '意向', '方案报价', '商务谈判', '已签约', '实施中', '服务中'],
    paused: false,
    pausedFrom: null,
    pausedIndex: null,

    contacts: [
      { name: '李校长', role: '校长', phone: '13800138001', relation: '决策人' },
      { name: '李老师', role: '教务主任', phone: '13800138011', relation: '对接人' },
      { name: '王老师', role: '信息中心主任', phone: '13800138012', relation: '技术负责人' },
    ],

    followUps: [
      { time: '2026-10-14 16:30', type: '面谈', user: '张三', content: '与校长沟通新学期设备采购计划，预计11月确定预算，下周三再次拜访', result: '积极推进' },
      { time: '2026-10-10 10:00', type: '电话', user: '张三', content: '确认校长时间安排，约定下周面谈', result: '待跟进' },
      { time: '2026-10-05 14:00', type: '面谈', user: '张三', content: '首次拜访，了解学校信息化现状，校方表示有兴趣尝试', result: '需培育' },
      { time: '2026-09-20 09:00', type: '系统', user: '系统', content: '创建学校线索，来源：展会获取', result: '-' },
    ],

    contracts: [
      { id: 'HT-2026-001', amount: 50000, signDate: '-', status: '待签署', products: '学情同步笔 x500', cycle: '1年' },
    ],

    devices: [],
    operations: [],
    logs: [
      { time: '2026-10-14 16:30', user: '张三', action: '写跟进记录', detail: '面谈 - 与校长沟通采购计划' },
      { time: '2026-10-10 10:00', user: '张三', action: '写跟进记录', detail: '电话 - 确认时间' },
      { time: '2026-10-05 14:00', user: '张三', action: '状态变更', detail: '意向 -> 方案报价' },
      { time: '2026-09-20 09:00', user: '张三', action: '创建学校', detail: '新建学校 - 阳光小学' },
    ],
  },

  // Records
  records: [
    { id: 1, time: '2026-10-14 16:30', school: '阳光小学', type: '销售记录', user: '张三', method: '面谈', content: '与校长沟通新学期设备采购计划', result: '积极推进' },
    { id: 2, time: '2026-10-14 10:00', school: '建设路中学', type: '销售记录', user: '张三', method: '电话', content: '确认合同金额，对方同意按原方案执行', result: '已完成' },
    { id: 3, time: '2026-10-13 14:00', school: '红星实验小学', type: '销售记录', user: '张三', method: '面谈', content: '提交产品演示，校方表示满意', result: '待跟进' },
    { id: 4, time: '2026-10-13 11:00', school: '育才中学', type: '运营记录', user: '赵六', method: '系统', content: '每周学情报告已生成并发送', result: '正常' },
    { id: 5, time: '2026-10-12 15:00', school: '希望小学', type: '运营记录', user: '赵六', method: '上门', content: '设备巡检，3台设备异常已处理', result: '已处理' },
    { id: 6, time: '2026-10-12 09:00', school: '光明实验小学', type: '销售记录', user: '张三', method: '电话', content: '催收合同尾款，对方承诺本周支付', result: '待收款' },
    { id: 7, time: '2026-10-11 16:00', school: '东风路小学', type: '运营记录', user: '赵六', method: '系统', content: '月度运营报告已提交', result: '正常' },
  ],

  // Users & roles
  users: [
    { id: 1, name: '张三', role: '销售', dept: '华东区', status: '启用', phone: '13800138001' },
    { id: 2, name: '李四', role: '销售', dept: '华南区', status: '启用', phone: '13800138002' },
    { id: 3, name: '王五', role: '销售', dept: '华北区', status: '启用', phone: '13800138003' },
    { id: 4, name: '赵六', role: '运营', dept: '华东区', status: '启用', phone: '13800138004' },
    { id: 5, name: '孙七', role: '运营', dept: '华南区', status: '停用', phone: '13800138005' },
    { id: 6, name: '周八', role: '管理员', dept: '总部', status: '启用', phone: '13800138006' },
  ],

  // Data management
  dataItems: [
    { name: '学校数据导出', type: '数据导出', time: '2026-10-14', status: '已完成' },
    { name: '跟进记录导出', type: '数据导出', time: '2026-10-13', status: '已完成' },
    { name: '合同数据同步', type: '数据同步', time: '2026-10-12', status: '已完成' },
    { name: '设备数据备份', type: '数据备份', time: '2026-10-10', status: '已完成' },
  ],

  // Operation logs
  operationLogs: [
    { time: '2026-10-14 16:30', user: '张三', action: '写跟进记录', target: '阳光小学', detail: '面谈 - 与校长沟通采购计划' },
    { time: '2026-10-14 14:00', user: '张三', action: '状态变更', target: '红星实验小学', detail: '意向 -> 方案报价' },
    { time: '2026-10-14 10:00', user: '张三', action: '写跟进记录', target: '建设路中学', detail: '电话 - 确认合同金额' },
    { time: '2026-10-13 15:00', user: '赵六', action: '运营记录', target: '育才中学', detail: '每周学情报告已发送' },
    { time: '2026-10-13 11:00', user: '张三', action: '录合同', target: '光明实验小学', detail: '合同编号 HT-2026-001' },
    { time: '2026-10-12 09:00', user: '周八', action: '用户管理', target: '系统', detail: '新增用户 王五' },
  ],

  // Operator dashboard
  operatorStats: {
    operating: 15,
    pendingHandover: 3,
    deviceOnline: 2800,
    warningCount: 5,
  },

  handoverList: [
    { school: '阳光小学', sales: '张三', desc: '已进入商务谈判，待签约后交接运营', status: '待确认' },
    { school: '红星实验小学', sales: '张三', desc: '方案报价已确认，待商务谈判后交接', status: '待确认' },
  ],

  operatorWarnings: [
    { school: '育才中学', type: '使用率下降', desc: '近7天使用率下降15%', level: 'red' },
    { school: '希望小学', type: '设备离线', desc: '3台设备离线超过24小时', level: 'yellow' },
  ],

  operatorSchools: [
    { name: '育才中学', students: 1200, usageRate: '78%', status: '服务中', deviceCount: 1200 },
    { name: '东风路小学', students: 350, usageRate: '92%', status: '服务中', deviceCount: 350 },
    { name: '希望小学', students: 300, usageRate: '65%', status: '服务中', deviceCount: 300 },
    { name: '光明实验小学', students: 800, usageRate: '85%', status: '服务中', deviceCount: 800 },
  ],
};

/* ==================== 当前用户信息 ==================== */
const currentUser = {
  name: '张三',
  dept: '华东区',
  role: '超级管理员'
};

/* ==================== 学校字典库（模拟） ==================== */
let schoolDictionary = [
  { id: 1, name: '阳光小学', region: '广州·越秀区', level: '小学', type: '公办', createTime: '2026-08-15 09:30:00', dept: '华南区' },
  { id: 2, name: '光明实验小学', region: '深圳·福田区', level: '小学', type: '公办', createTime: '2026-08-15 09:31:00', dept: '华南区' },
  { id: 3, name: '希望小学', region: '北京·海淀区', level: '小学', type: '民办', createTime: '2026-08-16 10:00:00', dept: '华北区' },
  { id: 4, name: '育才中学', region: '上海·浦东新区', level: '初中', type: '公办', createTime: '2026-08-16 10:15:00', dept: '华东区' },
  { id: 5, name: '蓝天幼儿园', region: '成都·锦江区', level: '幼儿园', type: '民办', createTime: '2026-08-17 14:00:00', dept: '西南区' },
  { id: 6, name: '建设路中学', region: '武汉·洪山区', level: '高中', type: '公办', createTime: '2026-08-18 09:00:00', dept: '华中区' },
  { id: 7, name: '红星实验小学', region: '杭州·西湖区', level: '小学', type: '公办', createTime: '2026-08-18 11:30:00', dept: '华东区' },
  { id: 8, name: '未来科技中学', region: '南京·江宁区', level: '九年一贯', type: '民办', createTime: '2026-08-19 15:00:00', dept: '华东区' },
  { id: 9, name: '翠湖小学', region: '广州·天河区', level: '小学', type: '公办', createTime: '2026-08-20 08:45:00', dept: '华南区' },
  { id: 10, name: '东风路小学', region: '长沙·岳麓区', level: '小学', type: '公办', createTime: '2026-08-20 10:20:00', dept: '华中区' },
];
let nextSchoolId = 11;

/* ==================== 学校名称自动匹配 ==================== */
let matchedSchool = null;

function autoMatchSchool(query) {
  const hintEl = document.getElementById('schoolMatchHint');
  const hintTextEl = document.getElementById('matchHintText');
  const autoFieldsEl = document.getElementById('autoFilledFields');
  
  if (!query || query.length < 2) {
    hintEl.style.display = 'none';
    autoFieldsEl.style.display = 'none';
    matchedSchool = null;
    return;
  }

  // 模糊匹配学校名称
  const matches = schoolDictionary.filter(s => s.name.includes(query));
  
  if (matches.length === 0) {
    hintEl.style.display = 'block';
    hintTextEl.innerHTML = `<span style="color:#f59e0b;">未找到匹配的学校字典信息，将使用默认值</span>`;
    autoFieldsEl.style.display = 'none';
    matchedSchool = null;
    return;
  }

  // 取第一个最匹配的结果
  matchedSchool = matches[0];
  hintEl.style.display = 'block';
  hintTextEl.innerHTML = `<span style="color:#10b981;">✓ 已匹配到 "${matchedSchool.name}"</span>`;
  
  // 填充自动获取的字段
  document.getElementById('autoDept').textContent = currentUser.dept; // 使用当前用户部门
  document.getElementById('autoRegion').textContent = matchedSchool.region;
  document.getElementById('autoLevel').textContent = matchedSchool.level;
  document.getElementById('autoType').textContent = matchedSchool.type;
  autoFieldsEl.style.display = 'block';
}

/* ==================== View Navigation ==================== */

function showView(viewName, navEl) {
  // Hide all views
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  // Show target view
  const view = document.getElementById(viewName + '-view');
  if (view) view.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
}

/* ==================== Stat Card Navigation ==================== */

function navigateToSchoolList(filter) {
  // Navigate to school list view
  const schoolNav = document.querySelector('[data-view="schoolList"]');
  showView('schoolList', schoolNav);

  // Clear previous filters
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

  // Apply filter based on type
  if (filter === 'signed-this-month') {
    const signedBtn = document.querySelector('.filter-btn[data-filter="已签约"]');
    if (signedBtn) signedBtn.classList.add('active');
  } else if (filter === 'negotiating') {
    // Show 意向, 方案报价, 商务谈判 stages
    const negotiateBtn = document.querySelector('.filter-btn[data-filter="商务谈判"]');
    if (negotiateBtn) negotiateBtn.classList.add('active');
  }
  // 'my-schools' shows all - no filter needed

  // Trigger re-render if render function exists
  if (typeof renderSchoolList === 'function') {
    renderSchoolList(filter);
  }
}

/* ==================== Target Settings ==================== */

function openTargetSettingsModal() {
  openModal('targetSettingsModal');
}

function saveTargetSettings() {
  // Collect form values and update the target progress display
  const form = document.getElementById('targetSettingsForm');
  const inputs = form.querySelectorAll('input');
  const values = {};
  inputs.forEach((input, i) => {
    const label = input.closest('.form-group').querySelector('label').textContent;
    values[label] = input.value;
  });

  // Update target progress items with new values
  const targetItems = document.querySelectorAll('.target-item');
  if (targetItems.length >= 4) {
    // Update 拜访次数
    const visitTarget = values['拜访次数'] || '20';
    const visitCurrent = targetItems[0].querySelector('.target-detail').textContent.split(' / ')[0];
    targetItems[0].querySelector('.target-detail').textContent = visitCurrent + ' / ' + visitTarget + ' 次';
    const visitPercent = Math.round((parseInt(visitCurrent) / parseInt(visitTarget)) * 100);
    targetItems[0].querySelector('.target-percent').textContent = visitPercent + '%';
    targetItems[0].querySelector('.fill').style.width = visitPercent + '%';

    // Update 签约学校数
    const schoolTarget = values['签约学校数'] || '3';
    const schoolCurrent = targetItems[1].querySelector('.target-detail').textContent.split(' / ')[0];
    targetItems[1].querySelector('.target-detail').textContent = schoolCurrent + ' / ' + schoolTarget + ' 所';
    const schoolPercent = Math.round((parseInt(schoolCurrent) / parseInt(schoolTarget)) * 100);
    targetItems[1].querySelector('.target-percent').textContent = schoolPercent + '%';
    targetItems[1].querySelector('.fill').style.width = Math.min(schoolPercent, 100) + '%';

    // Update 销售目标
    const salesTarget = values['销售目标（万元）'] || '10';
    const salesCurrent = targetItems[2].querySelector('.target-detail').textContent.split(' / ')[0];
    targetItems[2].querySelector('.target-detail').textContent = salesCurrent + '万 / ' + salesTarget + ' 万';
    const salesPercent = Math.round((parseFloat(salesCurrent) / parseFloat(salesTarget)) * 100);
    targetItems[2].querySelector('.target-percent').textContent = salesPercent + '%';
    targetItems[2].querySelector('.fill').style.width = Math.min(salesPercent, 100) + '%';

    // Update 自定义指标
    const customName = values['自定义指标名称'] || '回款金额';
    const customTarget = values['自定义指标目标值（万元）'] || '5';
    targetItems[3].querySelector('.target-name').textContent = '自定义：' + customName;
    const customCurrent = targetItems[3].querySelector('.target-detail').textContent.split(' / ')[0];
    targetItems[3].querySelector('.target-detail').textContent = customCurrent + ' / ' + customTarget + ' 万';
    const customPercent = Math.round((parseFloat(customCurrent) / parseFloat(customTarget)) * 100);
    targetItems[3].querySelector('.target-percent').textContent = customPercent + '%';
    targetItems[3].querySelector('.fill').style.width = Math.min(customPercent, 100) + '%';
  }

  closeModal('targetSettingsModal');
}

/* ==================== Modal ==================== */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}

/* ==================== Detail Tab Switch ==================== */

function switchDetailTab(el, tabName) {
  // Update tab buttons
  el.parentElement.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
  el.classList.add('active');

  // Update tab content visibility
  document.querySelectorAll('.detail-tab-content').forEach(content => content.style.display = 'none');
  const target = document.getElementById('detail-' + tabName);
  if (target) target.style.display = 'block';
}

/* ==================== Record Tab Switch ==================== */

function switchRecordTab(el, tabName) {
  el.parentElement.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
  el.classList.add('active');

  const recordsBody = document.getElementById('records-tbody');
  if (recordsBody) {
    const filtered = mockData.records.filter(r => {
      if (tabName === 'all') return true;
      if (tabName === 'sales') return r.type === '销售记录';
      if (tabName === 'operator') return r.type === '运营记录';
      return true;
    });
    recordsBody.innerHTML = filtered.map(r => `
      <tr>
        <td>${r.time}</td>
        <td><span class="text-link" onclick="showView('schoolDetail', null); showSchoolDetail(${r.id})">${r.school}</span></td>
        <td><span class="badge ${r.type === '销售记录' ? 'badge-blue' : 'badge-purple'}">${r.type}</span></td>
        <td>${r.user}</td>
        <td><span class="badge badge-gray">${r.method}</span></td>
        <td>${r.content}</td>
      </tr>
    `).join('');
  }
}

/* ==================== School Detail ==================== */

function showSchoolDetail(schoolId) {
  // For now, just show the detail view with mock data
  showView('schoolDetail', null);
  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const schoolNav = document.querySelector('[data-view="schoolList"]');
  if (schoolNav) schoolNav.classList.add('active');
}

function openSchoolDetail(schoolId) {
  showSchoolDetail(schoolId);
}

/* ==================== Operator Dashboard Navigation ==================== */

function goToOperatorRecords() {
  // Navigate to records view
  const recordsNav = document.querySelector('[data-view="records"]');
  showView('records', recordsNav);
  // Switch to operator records tab
  const operatorTab = document.querySelector('.tab-item[data-tab="operator"]');
  if (operatorTab) switchRecordTab(operatorTab, 'operator');
}

function goToMySchools() {
  // Navigate to school list and filter by current operator
  const schoolNav = document.querySelector('[data-view="schoolList"]');
  showView('schoolList', schoolNav);
  // Filter by current operator (孙七 for operator dashboard)
  if (typeof renderSchoolsTable === 'function') {
    const filtered = mockData.schools.filter(s => s.operator === '孙七');
    renderSchoolsTable(filtered);
  }
}

/* ==================== Status Badge Helper ==================== */

function getStatusBadge(status) {
  const map = {
    '初步接触': 'badge-gray',
    '意向': 'badge-yellow',
    '方案报价': 'badge-blue',
    '商务谈判': 'badge-purple',
    '已签约': 'badge-green',
    '实施中': 'badge-green',
    '服务中': 'badge-green',
    '暂停中': 'badge-yellow',
    '已终止': 'badge-red',
  };
  return map[status] || 'badge-gray';
}

/* ==================== Render Functions ==================== */

function renderRecordsTable(data) {
  const tbody = document.getElementById('records-tbody');
  if (!tbody) return;
  const list = data || mockData.records;
  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${r.time}</td>
      <td><span class="text-link" onclick="showSchoolDetail(${r.id})">${r.school}</span></td>
      <td><span class="badge ${r.type === '销售记录' ? 'badge-blue' : 'badge-purple'}">${r.type}</span></td>
      <td>${r.user}</td>
      <td><span class="badge badge-gray">${r.method}</span></td>
      <td>${r.content}</td>
    </tr>
  `).join('');
}

function renderSchoolsTable(data) {
  const tbody = document.getElementById('schools-tbody');
  if (!tbody) return;
  const list = data || mockData.schools;
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><span class="text-link" onclick="showSchoolDetail(${s.id})">${s.name}</span></td>
      <td>${s.dept}</td>
      <td>${s.region}</td>
      <td>${s.grade}</td>
      <td><span class="badge ${getStatusBadge(s.status)}">${s.status}</span></td>
      <td>${s.sales}</td>
      <td>${s.operator}</td>
      <td>${s.lastFollowUp}</td>
      <td>
        <span class="text-link" onclick="showSchoolDetail(${s.id})">详情</span>
        <span style="margin: 0 4px; color: #e2e8f0;">|</span>
        <span class="text-link" onclick="openModal('followUpModal')">写跟进</span>
      </td>
    </tr>
  `).join('');
}

/* ==================== Toast 提示 ==================== */

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message, type = 'success') {
  const container = getToastContainer();
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('hiding');setTimeout(()=>this.parentElement.remove(),300)">×</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ==================== 确认对话框 ==================== */

let confirmCallback = null;

function openConfirmModal(message, callback, type = 'warning') {
  confirmCallback = callback;
  const iconMap = {
    warning: { icon: '⚠', label: '确认操作' },
    danger: { icon: '✕', label: '危险操作' },
    info: { icon: 'ℹ', label: '确认' },
  };
  const cfg = iconMap[type] || iconMap.warning;

  document.querySelector('#confirmModal .confirm-modal-icon').className = `confirm-modal-icon ${type}`;
  document.querySelector('#confirmModal .confirm-modal-icon').textContent = cfg.icon;
  document.querySelector('#confirmModal .confirm-modal-text').textContent = message;
  openModal('confirmModal');
}

function onConfirmYes() {
  closeModal('confirmModal');
  if (confirmCallback) {
    confirmCallback(true);
    confirmCallback = null;
  }
}

function onConfirmNo() {
  closeModal('confirmModal');
  confirmCallback = null;
}

/* ==================== 基础交互函数 ==================== */

function handleLogout() {
  openConfirmModal('确定要退出登录吗？', (confirmed) => {
    if (confirmed) {
      showToast('已退出登录', 'info');
      setTimeout(() => {
        showView('login');
      }, 500);
    }
  }, 'info');
}

let currentSchoolFilter = '全部';
let currentDeptFilter = '';
let currentSalesFilter = '';

/**
 * 统一的筛选函数：同时应用状态、部门、销售和搜索关键词
 */
function applySchoolFilters() {
  const keyword = document.getElementById('schoolsTableInput')?.value?.trim() || '';
  const dept = document.getElementById('schoolDeptFilter')?.value || '';
  const sales = document.getElementById('schoolSalesFilter')?.value || '';

  let filtered = mockData.schools;

  // 状态筛选
  if (currentSchoolFilter !== '全部') {
    filtered = filtered.filter(s => s.status === currentSchoolFilter);
  }

  // 部门筛选
  if (dept) {
    filtered = filtered.filter(s => s.dept === dept);
  }

  // 销售筛选
  if (sales) {
    filtered = filtered.filter(s => s.sales === sales);
  }

  // 关键词搜索
  if (keyword) {
    filtered = filtered.filter(s =>
      s.name.includes(keyword) || s.region.includes(keyword) || s.grade.includes(keyword)
    );
  }

  renderSchoolsTable(filtered);
  return filtered;
}

function filterSchoolsByStatus(status) {
  currentSchoolFilter = status;
  // 更新 tab 高亮 - 修正选择器匹配实际HTML
  document.querySelectorAll('#schoolList-view .tabs .tab-item').forEach(item => {
    item.classList.toggle('active', item.textContent.trim().split(' ')[0] === status);
  });

  const filtered = applySchoolFilters();
  showToast(`筛选"${status}"，共 ${filtered.length} 所学校`, 'info');
}

function searchSchools() {
  const keyword = document.getElementById('schoolsTableInput')?.value?.trim() || '';
  if (!keyword) {
    const filtered = applySchoolFilters();
    showToast(`已重置搜索，共 ${filtered.length} 所学校`, 'info');
    return;
  }

  const filtered = applySchoolFilters();
  showToast(`搜索"${keyword}"，找到 ${filtered.length} 所学校`, 'info');
}

/**
 * 部门/销售筛选改变时触发
 */
function onSchoolFilterChange() {
  currentDeptFilter = document.getElementById('schoolDeptFilter')?.value || '';
  currentSalesFilter = document.getElementById('schoolSalesFilter')?.value || '';
  const filtered = applySchoolFilters();
  showToast(`筛选结果：共 ${filtered.length} 所学校`, 'info');
}

/**
 * 初始化学校筛选事件
 */
function initSchoolFilters() {
  const searchInput = document.getElementById('schoolsTableInput');
  if (searchInput) {
    // 支持回车搜索和输入时实时搜索
    searchInput.addEventListener('input', searchSchools);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchSchools();
    });
  }

  const deptSelect = document.getElementById('schoolDeptFilter');
  if (deptSelect) {
    deptSelect.addEventListener('change', onSchoolFilterChange);
  }

  const salesSelect = document.getElementById('schoolSalesFilter');
  if (salesSelect) {
    salesSelect.addEventListener('change', onSchoolFilterChange);
  }
}

let currentRecordFilter = '全部';

function searchRecords() {
  const keyword = document.querySelector('#recordsTableInput')?.value?.trim() || '';
  if (!keyword) {
    renderRecordsTable();
    showToast('已重置搜索', 'info');
    return;
  }

  let filtered = mockData.records.filter(r =>
    r.school.includes(keyword) || r.content.includes(keyword) || r.user.includes(keyword)
  );

  // 同时应用类型筛选
  if (currentRecordFilter !== '全部') {
    filtered = filtered.filter(r => r.type === currentRecordFilter);
  }

  renderRecordsTable(filtered);
  showToast(`搜索"${keyword}"，找到 ${filtered.length} 条记录`, 'info');
}

/* ==================== 弹窗表单提交 ==================== */

function submitFollowUp() {
  const inputs = document.querySelectorAll('#followUpModal .form-input, #followUpModal .form-select');
  const textarea = document.querySelector('#followUpModal .form-textarea');

  const school = inputs[0]?.value || '';
  const method = inputs[1]?.value || '';
  const nextStep = inputs[2]?.value || '';
  const content = textarea?.value || '';

  if (!school || !method || !content) {
    showToast('请填写学校、跟进方式和跟进内容', 'warning');
    return;
  }

  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  mockData.records.unshift({
    id: mockData.records.length + 1,
    time: timeStr,
    school: school,
    user: '张三（销售一部）',
    method: method,
    content: content,
    nextStep: nextStep,
  });

  renderRecordsTable();
  closeModal('followUpModal');

  // 清空表单
  inputs.forEach(input => input.value = '');
  textarea.value = '';

  showToast('跟进记录已保存', 'success');
}

function submitNewSchool() {
  const nameInput = document.getElementById('newSchoolName');
  const name = nameInput?.value || '';

  if (!name) {
    showToast('请填写学校名称', 'warning');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 使用自动匹配的信息，如果没有匹配则使用默认值
  const dept = matchedSchool ? currentUser.dept : currentUser.dept;
  const region = matchedSchool ? matchedSchool.region : '-';
  const level = matchedSchool ? matchedSchool.level : '-';
  const type = matchedSchool ? matchedSchool.type : '-';

  mockData.schools.unshift({
    id: mockData.schools.length + 1,
    name: name,
    status: '初步接触',
    dept: dept,
    sales: currentUser.name,
    contact: '-',
    phone: '-',
    students: 0,
    date: dateStr,
    region: region,
    level: level,
    type: type,
  });

  renderSchoolsTable();
  closeModal('newSchoolModal');

  // 清空表单
  nameInput.value = '';
  document.getElementById('schoolMatchHint').style.display = 'none';
  document.getElementById('autoFilledFields').style.display = 'none';
  matchedSchool = null;

  showToast(`学校"${name}"已创建`, 'success');
}

function submitContract() {
  const fileInput = document.getElementById('contractFileInput');
  const signDate = document.getElementById('contractSignDate').value;
  const remark = document.getElementById('contractRemark').value || '-';

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast('请上传合同文件', 'warning');
    return;
  }

  const fileName = fileInput.files[0].name;

  // 生成合同编号 HT-YYYY-NNN
  const year = new Date().getFullYear();
  const tbody = document.getElementById('contractTableBody');
  const rowCount = tbody ? tbody.rows.length + 1 : 1;
  const contractNo = `HT-${year}-${String(rowCount).padStart(3, '0')}`;

  // 在合同列表新增一行
  if (tbody) {
    const row = tbody.insertRow(0);
    row.innerHTML =
      `<td>${contractNo}</td>` +
      `<td>${signDate || '-'}</td>` +
      `<td><span class="text-link">${fileName}</span></td>` +
      `<td>${remark}</td>`;
  }

  closeModal('contractModal');

  // 清空表单
  fileInput.value = '';
  document.getElementById('contractSignDate').value = '';
  document.getElementById('contractRemark').value = '';

  showToast('合同已录入', 'success');
}

/* ==================== 学校状态变更 ==================== */

/* ==================== 状态流转条 ==================== */

/**
 * 渲染状态流转条
 */
function renderStatusFlow() {
  const bar = document.getElementById('statusFlowBar');
  if (!bar) return;

  const d = mockData.schoolDetail;
  const flow = d.statusFlow;
  const currentIndex = d.paused ? d.pausedIndex : d.statusIndex;
  const total = flow.length;
  const isPaused = d.paused && currentIndex === d.pausedIndex;

  const C = {
    green: '#22c55e',
    red: '#ef4444',
    gray: '#e2e8f0',
    grayText: '#94a3b8',
    paused: '#64748b',
  };

  // 构建整体：连接线 + 节点交替排列
  // 结构: node - line - node - line - ... - node
  let html = '<div class="sf-bar">';

  flow.forEach((stage, i) => {
    // 节点样式
    let bg, labelColor, fontWeight, inner;

    if (isPaused && i === currentIndex) {
      bg = C.paused;
      labelColor = C.paused;
      fontWeight = '600';
      inner = '<span class="sf-check">⏸</span>';
    } else if (i < currentIndex) {
      bg = C.green;
      labelColor = C.green;
      fontWeight = '500';
      inner = '<span class="sf-check">✓</span>';
    } else if (i === currentIndex) {
      bg = C.red;
      labelColor = C.red;
      fontWeight = '700';
      inner = '<span class="sf-num">' + (i + 1) + '</span>';
    } else {
      bg = C.gray;
      labelColor = C.grayText;
      fontWeight = '400';
      inner = '<span class="sf-num">' + (i + 1) + '</span>';
    }

    html += `
      <div class="sf-item">
        <div class="sf-circle" style="background:${bg};">
          ${inner}
        </div>
        <span class="sf-label" style="color:${labelColor};font-weight:${fontWeight};">${stage}</span>
      </div>`;

    // 节点之间的连接线（最后一个节点后不画线）
    if (i < total - 1) {
      // 线颜色：如果当前节点已完成，线为绿色；否则灰色
      let lineColor;
      if (i < currentIndex) {
        lineColor = C.green;
      } else {
        lineColor = C.gray;
      }
      html += `<div class="sf-line" style="background:${lineColor};"></div>`;
    }
  });

  html += '</div>';
  bar.innerHTML = html;

  // 内联样式（覆盖旧版本）
  let sfStyleEl = document.getElementById('sf-styles');
  if (!sfStyleEl) {
    sfStyleEl = document.createElement('style');
    sfStyleEl.id = 'sf-styles';
    document.head.appendChild(sfStyleEl);
  }
  sfStyleEl.textContent = `
      .sf-bar { display:flex; align-items:center; width:100%; }
      .sf-item { flex:1 1 0; display:flex; flex-direction:column; align-items:center; }
      .sf-circle {
        width:36px; height:36px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        flex-shrink:0; transition: all 0.3s;
      }
      .sf-check { color:#fff; font-size:16px; font-weight:600; }
      .sf-num { color:#fff; font-size:14px; font-weight:600; }
      .sf-label {
        font-size:12px; margin-top:6px; white-space:nowrap;
        text-align:center; max-width:70px;
      }
      .sf-line {
        flex:0 1 0; width:40px; min-width:20px; max-width:60px;
        height:2px;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 更新两处状态 badge（头部 + 基础信息）
 */
function updateSchoolStatusBadge() {
  const d = mockData.schoolDetail;
  let displayStatus = d.status;
  const badgeClass = getStatusBadge(displayStatus);

  // 头部 badge
  const headerBadge = document.getElementById('schoolHeaderBadge');
  if (headerBadge) {
    headerBadge.textContent = displayStatus;
    headerBadge.className = 'badge ' + badgeClass;
  }

  // 基础信息 badge
  const basicBadge = document.getElementById('basicInfoStatusBadge');
  if (basicBadge) {
    basicBadge.textContent = displayStatus;
    basicBadge.className = 'badge ' + badgeClass;
  }
}

/**
 * 切换操作按钮可见性（推进/暂停/终止 vs 恢复）
 */
function updateFlowButtonsVisibility() {
  const d = mockData.schoolDetail;
  const actions = document.getElementById('statusFlowActions');
  if (!actions) return;

  const resumeBtn = actions.querySelector('.btn-resume');
  const advanceBtn = actions.querySelector('[onclick="advanceSchool()"]');
  const pauseBtn = actions.querySelector('[onclick="pauseSchool()"]');
  const terminateBtn = actions.querySelector('[onclick="terminateSchool()"]');
  const handoverBtn = document.getElementById('handoverBtn');

  if (d.paused) {
    // 暂停状态：隐藏所有主按钮，显示恢复按钮
    if (advanceBtn) advanceBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (terminateBtn) terminateBtn.style.display = 'none';
    if (handoverBtn) handoverBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = '';
  } else if (d.status === '已终止') {
    // 终止状态：隐藏所有按钮
    if (advanceBtn) advanceBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (terminateBtn) terminateBtn.style.display = 'none';
    if (handoverBtn) handoverBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = 'none';
  } else if (d.status === '已签约' || d.status === '待交接') {
    // 已签约/待交接：隐藏"推进"，显示"交接给运营"
    if (advanceBtn) advanceBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = '';
    if (terminateBtn) terminateBtn.style.display = '';
    if (handoverBtn) handoverBtn.style.display = '';
    if (resumeBtn) resumeBtn.style.display = 'none';
  } else {
    // 正常状态：显示"推进到下一阶段"，隐藏"交接给运营"
    if (advanceBtn) advanceBtn.style.display = '';
    if (pauseBtn) pauseBtn.style.display = '';
    if (terminateBtn) terminateBtn.style.display = '';
    if (handoverBtn) handoverBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = 'none';
  }
}

/**
 * 在跟进记录时间线顶部添加一条记录
 */
function prependTimelineItem(type, user, content, time) {
  const timeline = document.getElementById('followUpTimeline');
  if (!timeline) return;

  // 系统记录使用灰色 badge，其他根据类型
  const badgeHtml = user === '系统'
    ? `<span class="timeline-operator">系统</span>`
    : `<span class="timeline-method badge" style="background:#dbeafe;color:#1d4ed8;">${type}</span><span class="timeline-operator">${user}</span>`;

  const item = document.createElement('div');
  item.className = 'timeline-item';
  item.innerHTML = `
    <div class="timeline-dot"></div>
    <div class="timeline-header">
      <div class="timeline-left">${badgeHtml}</div>
      <span class="timeline-time">${time || new Date().toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g, '-')}</span>
    </div>
    <div class="timeline-body">
      <div>${content}</div>
    </div>
  `;

  // 插入到时间线最前面
  if (timeline.firstChild) {
    timeline.insertBefore(item, timeline.firstChild);
  } else {
    timeline.appendChild(item);
  }
}

/**
 * 推进到下一阶段
 */
function advanceSchool() {
  const d = mockData.schoolDetail;
  if (d.paused) {
    showToast('该校处于暂停状态，请先恢复推进', 'warning');
    return;
  }
  if (d.status === '已终止') {
    showToast('该校已终止，无法推进', 'error');
    return;
  }

  const nextIndex = d.statusIndex + 1;
  if (nextIndex >= d.statusFlow.length) {
    showToast('已达最后阶段，无法继续推进', 'warning');
    return;
  }

  const prevStatus = d.status;
  const nextStatus = d.statusFlow[nextIndex];

  openConfirmModal(`确定要将「${d.name}」从「${prevStatus}」推进到「${nextStatus}」吗？`, (confirmed) => {
    if (confirmed) {
      d.status = nextStatus;
      d.statusIndex = nextIndex;

      renderStatusFlow();
      updateSchoolStatusBadge();
      updateFlowButtonsVisibility();
      prependTimelineItem('系统', '系统', `状态变更：${prevStatus} → ${nextStatus}`);
      showToast(`已推进至「${nextStatus}」`, 'success');
    }
  }, 'info');
}

/**
 * 暂停推进
 */
function pauseSchool() {
  const d = mockData.schoolDetail;
  if (d.paused) {
    showToast('该校已处于暂停状态', 'warning');
    return;
  }
  if (d.status === '已终止') {
    showToast('该校已终止，无法暂停', 'error');
    return;
  }

  openConfirmModal('确定要暂停推进该校吗？', (confirmed) => {
    if (confirmed) {
      // 保存当前状态
      d.pausedFrom = d.status;
      d.pausedIndex = d.statusIndex;
      d.paused = true;
      d.status = '暂停中';

      renderStatusFlow();
      updateSchoolStatusBadge();
      updateFlowButtonsVisibility();
      prependTimelineItem('系统', '系统', `暂停推进（原阶段：${d.pausedFrom}）`);
      showToast('已暂停推进该校', 'warning');
    }
  }, 'warning');
}

/**
 * 恢复推进
 */
function resumeSchool() {
  const d = mockData.schoolDetail;
  if (!d.paused) {
    showToast('该校未处于暂停状态', 'warning');
    return;
  }

  openConfirmModal(`确定要恢复推进「${d.name}」到「${d.pausedFrom}」吗？`, (confirmed) => {
    if (confirmed) {
      const restoredStatus = d.pausedFrom;
      d.status = d.pausedFrom;
      d.statusIndex = d.pausedIndex;
      d.paused = false;
      d.pausedFrom = null;
      d.pausedIndex = null;

      renderStatusFlow();
      updateSchoolStatusBadge();
      updateFlowButtonsVisibility();
      prependTimelineItem('系统', '系统', `恢复推进（恢复阶段：${restoredStatus}）`);
      showToast(`已恢复推进至「${restoredStatus}」`, 'success');
    }
  }, 'info');
}

/**
 * 终止推进
 */
function terminateSchool() {
  const d = mockData.schoolDetail;
  if (d.paused) {
    showToast('该校处于暂停状态，请先恢复推进', 'warning');
    return;
  }
  if (d.status === '已终止') {
    showToast('该校已终止', 'error');
    return;
  }

  openConfirmModal('⚠️ 确定要终止推进该校吗？终止后将无法恢复！', (confirmed) => {
    if (confirmed) {
      const prevStatus = d.status;
      d.status = '已终止';

      renderStatusFlow();
      updateSchoolStatusBadge();
      updateFlowButtonsVisibility();
      prependTimelineItem('系统', '系统', `终止推进（原阶段：${prevStatus}）`);
      showToast('已终止推进该校', 'error');
    }
  }, 'error');
}

/* ==================== 联系人管理 ==================== */

function openAddContactModal() {
  // 清空表单
  const inputs = document.querySelectorAll('#addContactModal .form-input');
  inputs.forEach(input => input.value = '');
  const roleSelect = document.getElementById('contactRoleSelect');
  if (roleSelect) roleSelect.value = '';
  openModal('addContactModal');
}

function submitAddContact() {
  const inputs = document.querySelectorAll('#addContactModal .form-input');
  const roleSelect = document.getElementById('contactRoleSelect');

  const name = inputs[0]?.value || '';
  const role = inputs[1]?.value || '';
  const phone = inputs[2]?.value || '';
  const relation = roleSelect?.value || '';

  if (!name || !role || !relation) {
    showToast('请填写联系人姓名、职务和角色', 'warning');
    return;
  }

  if (!mockData.schoolDetail.contacts) {
    mockData.schoolDetail.contacts = [];
  }

  mockData.schoolDetail.contacts.push({
    name: name,
    role: role,
    phone: phone || '-',
    relation: relation,
  });

  closeModal('addContactModal');
  inputs.forEach(input => input.value = '');
  roleSelect.value = '';
  showToast(`联系人"${name}"已添加`, 'success');
}

/* ==================== 用户管理 ==================== */

let editingUserId = null;

function openAddUserModal() {
  editingUserId = null;
  document.querySelector('#addUserModal h3').textContent = '新增用户';
  const inputs = document.querySelectorAll('#addUserModal .form-input, #addUserModal .form-select');
  inputs.forEach(input => {
    if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
  });
  openModal('addUserModal');
}

function openEditUserModal(userId) {
  const user = mockData.users.find(u => u.id === userId);
  if (!user) {
    showToast('用户不存在', 'error');
    return;
  }

  editingUserId = userId;
  document.querySelector('#editUserModal h3').textContent = '编辑用户';

  const inputs = document.querySelectorAll('#editUserModal .form-input, #editUserModal .form-select');
  if (inputs[0]) inputs[0].value = user.name;
  if (inputs[1]) inputs[1].value = user.phone;
  if (inputs[2]) inputs[2].value = user.email || '';
  if (inputs[3]) inputs[3].value = user.role;
  if (inputs[4]) inputs[4].value = user.dept;
  if (inputs[5]) inputs[5].selectedIndex = user.status === '活跃' ? 0 : 1;

  openModal('editUserModal');
}

function submitEditUser() {
  const inputs = document.querySelectorAll('#editUserModal .form-input, #editUserModal .form-select');

  const name = inputs[0]?.value || '';
  const phone = inputs[1]?.value || '';
  const email = inputs[2]?.value || '';
  const role = inputs[3]?.value || '';
  const dept = inputs[4]?.value || '';
  const status = inputs[5]?.value || '活跃';

  if (!name) {
    showToast('请填写用户姓名', 'warning');
    return;
  }

  const user = mockData.users.find(u => u.id === editingUserId);
  if (user) {
    user.name = name;
    user.phone = phone;
    user.email = email;
    user.role = role;
    user.dept = dept;
    user.status = status;
    showToast(`用户"${name}"已更新`, 'success');
  }

  closeModal('editUserModal');
}

function submitAddUser() {
  const inputs = document.querySelectorAll('#addUserModal .form-input, #addUserModal .form-select');

  const name = inputs[0]?.value || '';
  const phone = inputs[1]?.value || '';
  const email = inputs[2]?.value || '';
  const role = inputs[3]?.value || '销售';
  const dept = inputs[4]?.value || '销售一部';
  const status = inputs[5]?.value || '活跃';

  if (!name) {
    showToast('请填写用户姓名', 'warning');
    return;
  }

  mockData.users.push({
    id: mockData.users.length + 1,
    name: name,
    role: role,
    dept: dept,
    status: status,
    phone: phone,
    email: email,
  });

  closeModal('addUserModal');
  showToast(`用户"${name}"已创建`, 'success');
}

/* ==================== 数据管理 ==================== */

function downloadData(item) {
  showToast(`正在下载"${item.name}"...`, 'info');
  setTimeout(() => {
    showToast(`"${item.name}"下载完成`, 'success');
  }, 1500);
}

function viewData(item) {
  document.querySelector('#dataViewModal .data-view-title').textContent = item.name;
  document.querySelector('#dataViewModal .data-view-desc').textContent = `${item.desc} - 更新时间：${item.date}`;
  openModal('dataViewModal');
}

/* ==================== 数据导入 ==================== */

let currentImportType = '';
let currentImportFile = null;

function openImportModal(type) {
  currentImportType = type;
  currentImportFile = null;

  const title = document.getElementById('importModalTitle');
  const hint = document.getElementById('importModalHint');
  const fileInfo = document.getElementById('importFileInfo');
  const confirmBtn = document.getElementById('importConfirmBtn');

  if (type === 'school') {
    title.textContent = '导入学校数据';
    hint.textContent = '请上传包含学校信息的 Excel 文件，表头应包含：学校名称、负责人、联系电话、学校地址。';
  } else {
    title.textContent = '导入跟进记录';
    hint.textContent = '请上传包含跟进记录的 Excel 文件，表头应包含：学校名称、跟进人、跟进方式、跟进内容、跟进时间。';
  }

  fileInfo.style.display = 'none';
  confirmBtn.disabled = true;
  document.getElementById('importFileInput').value = '';

  openModal('dataImportModal');
}

function handleImportFileSelect(event) {
  const file = event.target.files[0];
  if (file) processImportFile(file);
}

function handleImportFileDrop(event) {
  const file = event.dataTransfer?.files[0];
  if (file) processImportFile(file);
}

function processImportFile(file) {
  // 验证文件格式
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'xlsx' && ext !== 'xls') {
    showToast('请上传 .xlsx 或 .xls 格式的文件', 'warning');
    return;
  }

  // 验证文件大小（最大10MB）
  if (file.size > 10 * 1024 * 1024) {
    showToast('文件大小不能超过 10MB', 'warning');
    return;
  }

  currentImportFile = file;

  // 显示文件信息
  document.getElementById('importFileName').textContent = file.name;
  document.getElementById('importFileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
  document.getElementById('importFileInfo').style.display = 'block';
  document.getElementById('importConfirmBtn').disabled = false;
}

function confirmImport() {
  if (!currentImportFile) {
    showToast('请先选择文件', 'warning');
    return;
  }

  const confirmBtn = document.getElementById('importConfirmBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '导入中...';

  // 模拟导入过程
  setTimeout(() => {
    const typeName = currentImportType === 'school' ? '学校数据' : '跟进记录';
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 在数据管理表格顶部添加导入记录
    const tbody = document.getElementById('dataManagement-tbody');
    if (tbody) {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `<td>${typeName}导入</td><td><span class="badge badge-purple">数据导入</span></td><td>${timeStr}</td><td><span class="badge badge-green">成功</span></td><td><span class="text-link" onclick="showToast('已查看导入详情', 'info')">查看</span></td>`;
      tbody.insertBefore(newRow, tbody.firstChild);
    }

    showToast(`${typeName}导入成功！`, 'success');

    // 重置并关闭弹窗
    confirmBtn.textContent = '开始导入';
    closeModal('dataImportModal');
  }, 1500);
}

/* ==================== 操作日志搜索 ==================== */

function searchLogs() {
  const keyword = (document.querySelector('#logsTableInput')?.value || '').trim();
  const typeFilter = document.querySelector('#logsTypeFilter')?.value || '';
  const rows = document.querySelectorAll('#operationLogs-tbody tr');
  let count = 0;

  rows.forEach(row => {
    const user = row.children[1]?.textContent || '';
    const action = row.children[2]?.textContent || '';
    const matchUser = !keyword || user.includes(keyword);
    const matchType = !typeFilter || action === typeFilter;
    if (matchUser && matchType) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });
}

function filterLogsByType() {
  searchLogs();
}

function resetLogsFilter() {
  const input = document.querySelector('#logsTableInput');
  const select = document.querySelector('#logsTypeFilter');
  if (input) input.value = '';
  if (select) select.value = '';
  searchLogs();
}

/* ==================== 学校字典 ==================== */

let schoolDictSearchText = '';

function renderSchoolDictionaryTable() {
  const tbody = document.getElementById('schoolDict-tbody');
  if (!tbody) return;

  const filtered = schoolDictionary.filter(s => {
    if (!schoolDictSearchText) return true;
    return s.name.includes(schoolDictSearchText) || s.region.includes(schoolDictSearchText);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:48px;color:#999;">暂无数据</td></tr>';
    return;
  }

  const levelBadge = { '小学': 'badge-blue', '初中': 'badge-purple', '高中': 'badge-orange', '九年一贯': 'badge-green', '幼儿园': 'badge-pink', '完全中学': 'badge-green' };
  const typeBadge = { '公办': 'badge-green', '民办': 'badge-orange', '国际': 'badge-blue' };

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.region}</td>
      <td><span class="badge ${levelBadge[s.level] || 'badge-gray'}">${s.level}</span></td>
      <td><span class="badge ${typeBadge[s.type] || 'badge-gray'}">${s.type}</span></td>
      <td style="color:#999;font-size:13px;">${s.createTime || '-'}</td>
      <td>
        <div class="table-actions">
          <button class="link-btn link-btn-edit" onclick="editSchool(${s.id})">编辑</button>
          <span class="table-actions-sep">|</span>
          <button class="link-btn link-btn-delete" onclick="confirmSchoolDelete(${s.id}, '${s.name}')">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchSchoolDictionary() {
  const input = document.getElementById('schoolDictInput');
  schoolDictSearchText = input ? input.value.trim() : '';
  renderSchoolDictionaryTable();
}

function openAddSchoolModal() {
  document.getElementById('schoolFormModalTitle').textContent = '新增学校';
  document.getElementById('schoolEditId').value = '';
  document.getElementById('schoolFormName').value = '';
  document.getElementById('schoolFormRegion').value = '';
  document.getElementById('schoolFormLevel').value = '';
  document.getElementById('schoolFormType').value = '';
  openModal('schoolFormModal');
}

function editSchool(id) {
  const school = schoolDictionary.find(s => s.id === id);
  if (!school) return;

  document.getElementById('schoolFormModalTitle').textContent = '编辑学校';
  document.getElementById('schoolEditId').value = school.id;
  document.getElementById('schoolFormName').value = school.name;
  document.getElementById('schoolFormRegion').value = school.region;
  document.getElementById('schoolFormLevel').value = school.level;
  document.getElementById('schoolFormType').value = school.type;
  openModal('schoolFormModal');
}

function saveSchool() {
  const editId = document.getElementById('schoolEditId').value;
  const name = document.getElementById('schoolFormName').value.trim();
  const region = document.getElementById('schoolFormRegion').value.trim();
  const level = document.getElementById('schoolFormLevel').value;
  const type = document.getElementById('schoolFormType').value;

  if (!name || !region || !level || !type) {
    alert('请填写所有必填项');
    return;
  }

  if (editId) {
    // 编辑
    const school = schoolDictionary.find(s => s.id === parseInt(editId));
    if (school) {
      school.name = name;
      school.region = region;
      school.level = level;
      school.type = type;
    }
  } else {
    // 新增
    const now = new Date();
    const createTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');
    schoolDictionary.push({
      id: nextSchoolId++,
      name,
      region,
      level,
      type,
      createTime,
      dept: '',
    });
  }

  closeModal('schoolFormModal');
  renderSchoolDictionaryTable();
}

function confirmSchoolDelete(id, name) {
  document.getElementById('deleteSchoolName').textContent = name;
  document.getElementById('deleteConfirmBtn').dataset.targetId = id;
  openModal('deleteConfirmModal');
}

function doDeleteSchool() {
  const id = parseInt(document.getElementById('deleteConfirmBtn').dataset.targetId);
  schoolDictionary = schoolDictionary.filter(s => s.id !== id);
  renderSchoolDictionaryTable();
  closeModal('deleteConfirmModal');
}

/* ==================== 学校字典批量导入 ==================== */

let batchImportFile = null;

function openBatchImportModal() {
  batchImportFile = null;
  document.getElementById('batchImportFileInfo').style.display = 'none';
  document.getElementById('batchImportConfirmBtn').disabled = true;
  document.getElementById('batchImportDropArea').style.display = '';
  document.getElementById('batchImportFileInput').value = '';
  openModal('batchImportModal');
}

function handleBatchImportSelect(event) {
  const file = event.target.files[0];
  if (file) processBatchImportFile(file);
}

function handleBatchImportDrop(event) {
  const file = event.dataTransfer?.files[0];
  if (file) processBatchImportFile(file);
}

function processBatchImportFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'xls'].includes(ext)) {
    alert('请上传 Excel 文件（.xlsx 或 .xls）');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('文件大小不能超过 10MB');
    return;
  }

  batchImportFile = file;
  document.getElementById('batchImportFileName').textContent = file.name;
  document.getElementById('batchImportFileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
  document.getElementById('batchImportFileInfo').style.display = 'block';
  document.getElementById('batchImportConfirmBtn').disabled = false;
}

function confirmBatchImport() {
  if (!batchImportFile) return;

  const btn = document.getElementById('batchImportConfirmBtn');
  btn.disabled = true;
  btn.textContent = '导入中...';

  setTimeout(() => {
    // 模拟导入 3 条数据
    const now = new Date();
    const fmt = (d) => d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');
    const mockData = [
      { name: '星辰小学', region: '北京·朝阳区', level: '小学', type: '公办', createTime: fmt(new Date(now - 86400000)) },
      { name: '智慧国际学校', region: '上海·闵行区', level: '九年一贯', type: '国际', createTime: fmt(new Date(now - 172800000)) },
      { name: '春雨幼儿园', region: '广州·海珠区', level: '幼儿园', type: '民办', createTime: fmt(new Date(now - 259200000)) },
    ];

    mockData.forEach(s => {
      schoolDictionary.push({
        id: nextSchoolId++,
        ...s,
        dept: '',
      });
    });

    btn.disabled = false;
    btn.textContent = '开始导入';
    closeModal('batchImportModal');
    renderSchoolDictionaryTable();
    alert('成功导入 3 所学校');
  }, 1500);
}

/* ==================== Sidebar Toggle ==================== */

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const isCollapsed = sidebar.classList.toggle('collapsed');
  document.body.classList.toggle('collapsed', isCollapsed);
  localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');

  // 更新按钮 title
  const btn = document.getElementById('sidebarToggle');
  btn.title = isCollapsed ? '展开侧边栏' : '收起侧边栏';
}

/* ==================== Init ==================== */

document.addEventListener('DOMContentLoaded', function () {
  // 恢复侧边栏状态
  const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === '1';
  if (sidebarCollapsed) {
    document.getElementById('sidebar').classList.add('collapsed');
    document.body.classList.add('collapsed');
  }

  // 根据角色隐藏菜单
  if (currentUser.role !== '超级管理员') {
    document.querySelectorAll('.nav-item[data-role]').forEach(item => {
      const requiredRole = item.getAttribute('data-role');
      if (requiredRole && !currentUser.roles?.includes(requiredRole)) {
        item.style.display = 'none';
      }
    });
  }
  renderRecordsTable();
  renderSchoolsTable();
  initSchoolFilters();
  renderSchoolDictionaryTable();
  // 记录管理搜索框
  const recordsInput = document.getElementById('recordsTableInput');
  if (recordsInput) {
    recordsInput.addEventListener('input', searchRecords);
  }
  // 操作日志搜索框
  const logsInput = document.getElementById('logsTableInput');
  if (logsInput) {
    logsInput.addEventListener('input', searchLogs);
  }
  // 交接给运营按钮 - 仅已签约状态显示
  updateHandoverButtonVisibility();
  // 学校详情页状态流转条初始化
  renderStatusFlow();
  updateFlowButtonsVisibility();
});

/* ===================== 交接给运营 ===================== */

function updateHandoverButtonVisibility() {
  const btn = document.getElementById('handoverBtn');
  if (!btn) return;
  // 仅在学校详情页且状态为"已签约"时显示
  const isSigned = mockData.schoolDetail.status === '已签约';
  btn.style.display = isSigned ? '' : 'none';
}

function openHandoverModal() {
  // 重置表单
  const opSelect = document.getElementById('handoverOperator');
  const note = document.getElementById('handoverNote');
  if (opSelect) opSelect.value = '';
  if (note) note.value = '';
  openModal('handoverModal');
}

function submitHandover() {
  const opSelect = document.getElementById('handoverOperator');
  const note = document.getElementById('handoverNote');
  const operator = opSelect.value;
  const handoverNote = note.value.trim();

  // 校验
  if (!operator) {
    showToast('请选择交接给哪个运营', 'error');
    return;
  }
  if (!handoverNote) {
    showToast('请填写交接备注', 'error');
    return;
  }

  const schoolName = mockData.schoolDetail.name;

  // 模拟提交成功 - 在待交接列表动态添加一条
  addHandoverItem(schoolName, operator, handoverNote);

  // 关闭弹窗
  closeModal('handoverModal');
  showToast(`已将"${schoolName}"提交交接给${operator}`, 'success');

  // 更新学校状态，隐藏交接按钮
  mockData.schoolDetail.status = '待交接';
  updateHandoverButtonVisibility();
}

function addHandoverItem(schoolName, operator, note) {
  const container = document.getElementById('pendingHandoverList');
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'warning-item';
  item.id = `pendingHandover-${schoolName}`;
  item.innerHTML = `
    <div class="warning-dot warn"></div>
    <div class="warning-info">
      <div class="warning-name">${schoolName}</div>
      <div class="warning-desc">销售：${currentUser.name} - ${note}</div>
    </div>
    <span class="warning-tag yellow">待确认</span>
    <div style="display:flex;gap:6px;flex-shrink:0;">
      <button class="btn btn-primary btn-xs" onclick="requestConfirmHandover('${schoolName}')">确认接收</button>
      <button class="btn btn-xs" style="background:#dc2626;color:#fff;" onclick="rejectHandover('${schoolName}')">拒绝</button>
    </div>
  `;
  container.appendChild(item);
}

function requestConfirmHandover(schoolName) {
  openConfirmModal(
    `确定要接收"${schoolName}"吗？`,
    (confirmed) => {
      if (confirmed) {
        confirmHandover(schoolName);
      }
    },
    'info'
  );
}

function confirmHandover(schoolName) {
  // 移除待交接项
  const item = document.getElementById(`pendingHandover-${schoolName}`);
  if (item) {
    item.remove();
  }

  // 在负责学校列表中添加
  addManagedSchool(schoolName);

  // 如果当前在详情页，同步更新状态为"实施中"
  if (currentPage === 'schoolDetail' && mockData.schoolDetail.name === schoolName) {
    mockData.schoolDetail.status = '实施中';
    mockData.schoolDetail.statusIndex = 5;
    renderStatusFlow();
    updateFlowButtonsVisibility();
    // 更新页面中的状态显示
    const statusEl = document.getElementById('schoolStatus');
    if (statusEl) statusEl.textContent = '实施中';
  }

  showToast(`已确认接收"${schoolName}"，状态已更新为"实施中"`, 'success');
}

function rejectHandover(schoolName) {
  // 移除待交接项
  const item = document.getElementById(`pendingHandover-${schoolName}`);
  if (item) {
    item.remove();
  }

  showToast(`已拒绝"${schoolName}"的交接请求`, 'info');
}

function openOperationLogModal() {
  openModal('operationLogModal');
}

function submitOperationLog() {
  const school = document.getElementById('opLogSchool')?.value || '';
  const type = document.getElementById('opLogType')?.value || '';
  const content = document.getElementById('opLogContent')?.value || '';
  const time = document.getElementById('opLogTime')?.value || '';

  if (!school || !type || !content) {
    showToast('请填写学校、记录类型和服务内容', 'warning');
    return;
  }

  const now = time || new Date().toISOString().slice(0, 16).replace('T', ' ');

  mockData.records.unshift({
    id: mockData.records.length + 1,
    time: now,
    school: school,
    type: '运营记录',
    user: currentUser.name,
    method: type,
    content: content,
    result: '已完成',
  });

  renderRecordsTable();
  closeModal('operationLogModal');

  // 清空表单
  document.getElementById('opLogSchool').value = '';
  document.getElementById('opLogType').value = '';
  document.getElementById('opLogContent').value = '';
  document.getElementById('opLogTime').value = '';

  showToast('运营记录已保存', 'success');
}

function addManagedSchool(schoolName) {
  const table = document.querySelector('#operatorDashboard-view .data-table tbody');
  if (!table) return;

  const today = new Date().toISOString().slice(0, 10);
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><span class="text-link" onclick="openSchoolDetail(1)">${schoolName}</span></td>
    <td><span class="badge badge-purple">实施中</span></td>
    <td>${currentUser.name}</td>
    <td>${today}</td>
    <td>
      <div class="action-btns">
        <button class="action-btn" onclick="openSchoolDetail(1)">详情</button>
      </div>
    </td>
  `;
  table.appendChild(row);
}
