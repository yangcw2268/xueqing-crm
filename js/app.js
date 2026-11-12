// ========== 全局数据变量 ==========
let schoolsData = [];
let recordsData = [];
let editingRecordId = null;
let usersData = [];
let schoolDictData = [];
let nextSchoolDictId = 1;
let schoolDetail = null;
let schoolContacts = [];
let currentSchoolId;
let currentPage = null;
let lockedSchoolId = null; // 锁定学校ID（从学校列表行进入工作记录时使用）

// ========== 省份-地级市数据（用于学校字典区域两级联动） ==========
const REGION_DATA = {
  '北京': ['北京市'],
  '天津': ['天津市'],
  '上海': ['上海市'],
  '重庆': ['重庆市'],
  '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化'],
  '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
  '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
  '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
  '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店'],
  '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底'],
  '广东': ['广州', '韶关', '深圳', '珠海', '汕头', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
  '海南': ['海口', '三亚', '三沙', '儋州'],
  '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳'],
  '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧'],
  '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲'],
  '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
  '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南'],
  '青海': ['西宁', '海东'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密'],
  '台湾': ['台北', '高雄', '台中', '台南', '新北'],
  '香港': ['香港'],
  '澳门': ['澳门'],
};

function initProvinceOptions() {
  const sel = document.getElementById('schoolFormProvince');
  if (!sel || sel.options.length > 1) return;
  Object.keys(REGION_DATA).forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    sel.appendChild(opt);
  });
}

// 省份变化时，联动更新城市下拉框
function triggerCitySelect(province) {
  const citySel = document.getElementById('schoolFormCity');
  if (!citySel) return;

  if (!province || !REGION_DATA[province]) {
    citySel.innerHTML = '<option value="">请选择城市</option>';
    citySel.disabled = true;
    return;
  }

  citySel.innerHTML = '<option value="">请选择城市</option>' +
    REGION_DATA[province].map(city => `<option value="${city}">${city}</option>`).join('');
  citySel.disabled = false;
}

// 新增学校弹窗 - 省份变化时，联动更新城市下拉框
function triggerNewSchoolCitySelect(province) {
  const citySel = document.getElementById('newSchoolCity');
  if (!citySel) return;

  if (!province || !REGION_DATA[province]) {
    citySel.innerHTML = '<option value="">请选择城市</option>';
    citySel.disabled = true;
    return;
  }

  citySel.innerHTML = '<option value="">请选择城市</option>' +
    REGION_DATA[province].map(city => `<option value="${city}">${city}</option>`).join('');
  citySel.disabled = false;
}

// 初始化新增学校弹窗的省份选项
function initNewSchoolProvinceOptions() {
  const sel = document.getElementById('newSchoolProvince');
  if (!sel || sel.options.length > 1) return;
  Object.keys(REGION_DATA).forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    sel.appendChild(opt);
  });
}

// 设置新增学校弹窗的区域值（从 "省份-城市" 格式解析）
function setNewSchoolRegion(region) {
  if (!region || region === '-') return;

  // 显示文本输入框，隐藏下拉选择
  const regionText = document.getElementById('newSchoolRegionText');
  const regionSelects = document.getElementById('newSchoolRegionSelects');
  if (regionText) {
    regionText.value = region;
    regionText.style.display = 'block';
  }
  if (regionSelects) {
    regionSelects.style.display = 'none';
  }

  // 同时保持下拉框的值（兼容性）
  const parts = region.split('-');
  const province = parts[0] || '';
  const city = parts[1] || '';

  const provSel = document.getElementById('newSchoolProvince');
  const citySel = document.getElementById('newSchoolCity');
  if (!provSel || !citySel) return;

  provSel.value = province;
  triggerNewSchoolCitySelect(province);

  setTimeout(() => {
    citySel.value = city;
  }, 0);
}

// 获取新增学校弹窗的区域值（返回 "省份-城市" 格式）
function getNewSchoolRegion() {
  // 优先从文本输入框读取（字典匹配模式）
  const regionText = document.getElementById('newSchoolRegionText');
  if (regionText && regionText.style.display !== 'none' && regionText.value) {
    return regionText.value;
  }

  // 否则从下拉框读取（手动输入模式）
  const provSel = document.getElementById('newSchoolProvince');
  const citySel = document.getElementById('newSchoolCity');
  if (!provSel || !citySel) return '-';
  const province = provSel.value;
  const city = citySel.value;
  if (province && city) return province + '-' + city;
  return '-';
}

// 清空新增学校弹窗的区域下拉
function clearNewSchoolRegion() {
  const provSel = document.getElementById('newSchoolProvince');
  const citySel = document.getElementById('newSchoolCity');
  if (provSel) {
    provSel.value = '';
    provSel.disabled = true;
  }
  if (citySel) {
    citySel.innerHTML = '<option value="">请选择城市</option>';
    citySel.value = '';
    citySel.disabled = true;
  }
}

// 启用新增学校弹窗的区域下拉
function enableNewSchoolRegion() {
  const provSel = document.getElementById('newSchoolProvince');
  const citySel = document.getElementById('newSchoolCity');
  if (provSel) provSel.disabled = false;
  if (citySel) citySel.disabled = false;
}

// 禁用新增学校弹窗的区域下拉
function disableNewSchoolRegion() {
  const provSel = document.getElementById('newSchoolProvince');
  const citySel = document.getElementById('newSchoolCity');
  if (provSel) provSel.disabled = true;
  if (citySel) citySel.disabled = true;
}

// ========== API 数据加载 ==========
async function loadData() {
  try {
    const [schoolsRes, recordsRes, usersRes, schoolDictRes, statsRes] = await Promise.all([
      API.getSchools(),
      API.getRecords(),
      API.getUsers(),
      API.getSchoolDict(),
      API.getSchoolStats(),
    ]);

    if (schoolsRes && schoolsRes.success === true) {
      // 标准化学校字段（API 返回 sales_name/operator_name，前端使用 sales/operator）
      schoolsData = (schoolsRes.data || []).map(s => ({
        ...s,
        sales: s.sales_name || '-',
        operator: s.operator_name || '-',
      }));
    }
    if (usersRes && usersRes.success === true) {
      usersData = usersRes.data || [];
      populateFilterOptions();
    }
    if (schoolDictRes && schoolDictRes.success === true) {
      // 标准化字段：后端返回 grade，前端统一使用 level
      schoolDictData = (schoolDictRes.data || []).map(s => ({
        ...s,
        level: s.grade || s.level || '',
        createTime: s.created_at || '',
      }));
      // 计算下一个ID
      const maxId = schoolDictData.reduce((max, s) => Math.max(max, s.id || 0), 0);
      nextSchoolDictId = maxId + 1;
    }

    // 标准化工作记录字段（API 返回 school_name/user_name/created_at，前端使用 school/user/time）
    if (recordsRes && recordsRes.success === true) {
      console.log('[工作记录] API返回原始数据:', recordsRes.data);
      const schoolDict = {};
      schoolsData.forEach(s => { schoolDict[s.id] = s.name; });
      recordsData = (recordsRes.data || [])
        .map(r => ({
          id: r.id,
          school_id: r.school_id,
          school: schoolDict[r.school_id] || r.school_name || '未知学校',
          type: r.type || '工作记录',
          user: r.user_name || '-',
          content: r.content || '',
          next_step: r.next_step || '',
          time: r.created_at || '',
          record_status: r.record_status,
          school_status: r.school_status,
        }));
      console.log('[工作记录] 处理后 recordsData:', recordsData.length, '条');
    } else {
      console.warn('[工作记录] API返回异常:', recordsRes);
    }

    // 渲染状态 Tab（从后端获取真实数量）
    if (statsRes && statsRes.success === true) {
      renderSchoolTabs(statsRes.data);
    }

    // 加载操作日志和数据管理
    await renderOperationLogs();
    await renderDataManagement();
  } catch (e) {
    console.error('加载数据失败:', e);
  }
}



async function loadSchoolDetail(schoolId) {
  try {
    const res = await API.getSchool(schoolId);
    if (res && res.success === true) {
      const statusFlow = ['初步接触', '有意向', '方案沟通', '已签约', '运营中', '已到期'];
      const prev = schoolDetail || {};
      schoolDetail = {
        ...res.data,
        statusFlow,
        statusIndex: statusFlow.indexOf(res.data.status),
        // 根据数据库状态判断是否暂停
        paused: res.data.status === '暂停中',
        // 从 paused_from 读取暂停前的状态
        pausedFrom: res.data.paused_from || null,
        pausedIndex: res.data.paused_from ? statusFlow.indexOf(res.data.paused_from) : -1,
        sales: res.data.sales_name || prev.sales || '-',
        operator: res.data.operator_name || prev.operator || '-',
        operator_ids: res.data.operator_ids,
      };
      // Update operator display
      {
        const detailOperator = document.getElementById('detailOperator');
        if (detailOperator) {
          detailOperator.textContent = getOperatorNames(res.data) || '-';
        }
      }
      renderStatusFlow();
      updateFlowButtonsVisibility();
      updateDetailButtonsVisibility();
      updateSchoolStatusBadge();

      // 加载联系人
      const contactsRes = await API.getContacts(schoolId);
      schoolContacts = contactsRes.data || [];
      renderContacts();

      // 加载工作记录时间线
      renderTimeline(schoolId);

      // 加载合同信息
      renderContractsTable(schoolId);

      // 加载设备投放记录
      renderDeviceDeploymentTable(schoolId);


    }
  } catch (e) {
    console.error('加载学校详情失败:', e);
  }
}

/* ==================== Dashboard 数据 ==================== */

let salesStats = { pendingContact: 0, pendingContract: 0, pendingPayment: 0 };
let overdueWarnings = [];
let monthlyTargets = [];
let recentFollowUps = [];
let operatorStats = { operating: 0, deviceOnline: 0, warningCount: 0 };
let operatorWarnings = [];
let operatorSchools = [];
let dataItems = [];
let operationLogs = [];

/* ==================== 当前用户信息 ==================== */
let currentUser = API.getUser() || {
  name: '张三',
  dept: '华东区',
  role: '超级管理员',
  id: 1,
  menus: []
};

function getCurrentUserName() {
  return currentUser.name || '未知用户';
}

/* ==================== 侧边栏菜单 SVG 图标映射 ==================== */
const MENU_ICONS = {
  dashboard: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  schoolList: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/>',
  records: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  workRecords: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  dataManagement: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  operationLogs: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  schoolDictionary: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  workReportsList: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/>',
};

/**
 * 根据后端返回的 menus 数组动态渲染侧边栏
 */
function renderSidebarMenus(menus) {
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  if (!menus || menus.length === 0) return;

  // 按 group 分组
  const groups = {};
  menus.forEach(menu => {
    if (!groups[menu.group]) {
      groups[menu.group] = [];
    }
    groups[menu.group].push(menu);
  });

  // 排序（按第一个菜单的 order）
  const groupOrder = Object.keys(groups).sort((a, b) => {
    const aOrder = groups[a].sort((x, y) => x.order - y.order)[0].order;
    const bOrder = groups[b].sort((x, y) => x.order - y.order)[0].order;
    return aOrder - bOrder;
  });

  let html = '';
  groupOrder.forEach(groupName => {
    const items = groups[groupName].sort((a, b) => a.order - b.order);
    const isSystem = groupName === '系统管理';
    html += `<div class="nav-group${isSystem ? '' : ''}" id="${groupName}Group">`;
    html += `<div class="nav-group-header${isSystem ? ' collapsible' : ''}"${isSystem ? ` onclick="toggleNavGroup('${groupName}Group')"` : ''}>`;
    html += `<span class="nav-group-title">${groupName}</span>`;
    if (isSystem) {
      html += '<svg class="nav-group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    }
    html += '</div>';
    html += '<div class="nav-group-items">';
    items.forEach(menu => {
      const icon = MENU_ICONS[menu.id] || '';
      html += `<div class="nav-item" data-view="${menu.view}" onclick="showView('${menu.view}', this)">`;
      html += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg>`;
      html += `<span class="nav-text">${menu.name}</span>`;
      html += '</div>';
    });
    html += '</div></div>';
  });

  nav.innerHTML = html;
}

/* ==================== 学校名称搜索下拉 ==================== */
let matchedSchool = null;
let isManualMode = false;

function autoMatchSchool(query) {
  const dropdown = document.getElementById('schoolSearchDropdown');
  const extraFields = document.getElementById('schoolExtraFields');
  const provinceSelect = document.getElementById('newSchoolProvince');
  const citySelect = document.getElementById('newSchoolCity');
  const levelSelect = document.getElementById('newSchoolLevel');
  const typeSelect = document.getElementById('newSchoolType');
  const regionText = document.getElementById('newSchoolRegionText');
  const regionSelects = document.getElementById('newSchoolRegionSelects');

  // 清空输入时隐藏一切
  if (!query || query.length < 1) {
    dropdown.style.display = 'none';
    extraFields.style.display = 'none';
    document.getElementById('schoolNoMatchHint').style.display = 'none';
    document.getElementById('selectedSchoolHint').style.display = 'none';
    matchedSchool = null;
    isManualMode = false;
    provinceSelect.disabled = true;
    citySelect.disabled = true;
    levelSelect.disabled = true;
    typeSelect.disabled = true;
    // 重置区域字段显示
    if (regionText) { regionText.value = ''; regionText.style.display = 'none'; }
    if (regionSelects) regionSelects.style.display = 'flex';
    return;
  }

  // 模糊匹配学校名称
  const matches = schoolDictData.filter(s => s.name.includes(query));

  if (matches.length > 0) {
    // 有匹配：显示下拉列表，但额外字段仍然隐藏
    dropdown.style.display = 'block';
    extraFields.style.display = 'none';
    document.getElementById('schoolNoMatchHint').style.display = 'none';
    isManualMode = false;

    // 渲染下拉选项
    dropdown.innerHTML = matches.map(s => `
      <div class="school-search-item" onclick="selectSchoolFromDropdown(${s.id})">
        <div class="school-search-item-name">${highlightMatch(s.name, query)}</div>
        <div class="school-search-item-meta">${s.region} · ${s.level} · ${s.type}</div>
      </div>
    `).join('');
  } else {
    // 无匹配：隐藏下拉列表，显示额外字段供手动填写
    dropdown.style.display = 'none';
    extraFields.style.display = 'block';
    document.getElementById('schoolNoMatchHint').style.display = 'block';
    isManualMode = true;

    // 手动模式：显示下拉框，隐藏文本框
    if (regionText) { regionText.value = ''; regionText.style.display = 'none'; }
    if (regionSelects) regionSelects.style.display = 'flex';

    // 启用表单字段
    provinceSelect.disabled = false;
    citySelect.disabled = false;
    levelSelect.disabled = false;
    typeSelect.disabled = false;
  }
}

// 高亮匹配文字
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'g');
  return text.replace(regex, '<mark style="background:#fef3c7;padding:0 2px;border-radius:2px;">$1</mark>');
}

// 从下拉列表选择学校
function selectSchoolFromDropdown(schoolId) {
  const school = schoolDictData.find(s => s.id === schoolId);
  if (!school) return;

  matchedSchool = school;
  isManualMode = false;

  // 关闭下拉列表
  document.getElementById('schoolSearchDropdown').style.display = 'none';
  document.getElementById('schoolNoMatchHint').style.display = 'none';

  // 填充表单字段
  document.getElementById('newSchoolName').value = school.name;
  setNewSchoolRegion(school.region);
  document.getElementById('newSchoolLevel').value = school.level;
  document.getElementById('newSchoolType').value = school.type;

  // 显示额外字段，设为灰色不可编辑
  const extraFields = document.getElementById('schoolExtraFields');
  extraFields.style.display = 'block';
  document.getElementById('newSchoolProvince').disabled = true;
  document.getElementById('newSchoolCity').disabled = true;
  document.getElementById('newSchoolLevel').disabled = true;
  document.getElementById('newSchoolType').disabled = true;

  // 显示选中提示
  const hint = document.getElementById('selectedSchoolHint');
  document.getElementById('selectedSchoolName').textContent = `${school.name} (${school.region} · ${school.level} · ${school.type})`;
  hint.style.display = 'block';
}

// 清除学校选择
function clearSchoolSelection() {
  matchedSchool = null;
  isManualMode = false;

  // 清空表单
  document.getElementById('newSchoolName').value = '';
  document.getElementById('newSchoolProvince').value = '';
  document.getElementById('newSchoolProvince').disabled = true;
  document.getElementById('newSchoolCity').innerHTML = '<option value="">请选择城市</option>';
  document.getElementById('newSchoolCity').disabled = true;
  document.getElementById('newSchoolLevel').value = '';
  document.getElementById('newSchoolLevel').disabled = true;
  document.getElementById('newSchoolType').value = '';
  document.getElementById('newSchoolType').disabled = true;

  // 重置区域字段显示
  const regionText = document.getElementById('newSchoolRegionText');
  const regionSelects = document.getElementById('newSchoolRegionSelects');
  if (regionText) { regionText.value = ''; regionText.style.display = 'none'; }
  if (regionSelects) regionSelects.style.display = 'flex';

  // 隐藏所有额外元素
  document.getElementById('schoolExtraFields').style.display = 'none';
  document.getElementById('selectedSchoolHint').style.display = 'none';
  document.getElementById('schoolNoMatchHint').style.display = 'none';
  document.getElementById('schoolSearchDropdown').style.display = 'none';
}

// 点击其他地方关闭下拉列表
document.addEventListener('click', function(e) {
  const container = document.querySelector('.school-search-container');
  const dropdown = document.getElementById('schoolSearchDropdown');
  if (container && !container.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

/* ==================== View Navigation ==================== */

function showView(viewName, navEl) {
  currentPage = viewName;
  // 如果未传入 navEl，根据 viewName 查找
  if (!navEl) navEl = document.querySelector('.nav-item[data-view="' + viewName + '"]');
  // Hide all views
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  // Show target view
  const view = document.getElementById(viewName + '-view');
  if (view) view.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  // 工作台页面加载数据
  if (viewName === 'dashboard' && typeof renderEmployeeDashboard === 'function') {
    renderEmployeeDashboard();
  }

  // 进入记录管理页面时初始化 Tab 显示
  if (viewName === 'records' && typeof initRecordsTabs === 'function') {
    initRecordsTabs();
  }

  // 工作管理列表页初始化
  if (viewName === 'workReportsList' && typeof renderWorkReportsList === 'function') {
    renderWorkReportsList();
    // 按角色控制按钮显示：只有"员工"角色能填写汇报和设置目标
    const isEmployee = currentUser.role === '员工';
    const fillBtn = document.getElementById('workReportFillBtn');
    const goalBtn = document.getElementById('monthlyGoalSetBtn');
    if (fillBtn) fillBtn.style.display = isEmployee ? '' : 'none';
    if (goalBtn) goalBtn.style.display = isEmployee ? '' : 'none';
  }

  // 我的页面初始化
  if (viewName === 'my' && typeof fillProfileInfo === 'function') {
    fillProfileInfo();
  }

  // ==================== 移动端状态同步 ====================
  // 1. 关闭抽屉侧边栏
  closeMobileDrawer();

  // 2. 更新抽屉侧边栏 active 状态
  document.querySelectorAll('.mobile-drawer-item').forEach(function(item) {
    item.classList.toggle('active', item.getAttribute('data-view') === viewName);
  });

  // 3. 更新底部Tab active 状态
  const viewToTab = {
    dashboard: 'tab-workspace',
    schoolList: 'tab-schools',
    records: 'tab-records',
    workReportsList: 'tab-reports',
    workReportForm: 'tab-reports',
    my: 'tab-profile'
  };
  const activeTabId = viewToTab[viewName];
  if (activeTabId) {
    document.querySelectorAll('.mobile-tabbar-item').forEach(function(tab) {
      tab.classList.toggle('active', tab.id === activeTabId);
    });
  }

  // 4. 控制汉堡菜单 / 返回按钮 / FAB 显示
  const hamburgerBtns = document.querySelectorAll('.mobile-hamburger');
  const backBtns = document.querySelectorAll('.mobile-back-btn');
  const fabBtn = document.getElementById('fabButton');

  hamburgerBtns.forEach(function(btn) { btn.style.display = 'none'; });
  backBtns.forEach(function(btn) { btn.style.display = 'none'; });
  if (fabBtn) fabBtn.style.display = 'none';

  if (viewName === 'schoolDetail' || (viewName === 'workReportForm' && isMobileView())) {
    // 学校详情页 / 汇报表单页（移动端）显示返回按钮
    backBtns.forEach(function(btn) { btn.style.display = 'block'; });
  } else if (['dashboard', 'schoolList', 'records', 'users', 'my', 'dataManagement', 'operationLogs', 'schoolDictionary', 'workReportsList'].includes(viewName)) {
    // 一级页面显示汉堡菜单
    hamburgerBtns.forEach(function(btn) { btn.style.display = 'block'; });
    // 所有列表页显示FAB
    if (fabBtn && ['dashboard', 'schoolList', 'records', 'workReportsList'].includes(viewName)) {
      fabBtn.style.display = 'flex';
      closeFabMenu();
    }
  }
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
    // Show 有意向, 方案沟通 stages
    const negotiateBtn = document.querySelector('.filter-btn[data-filter="方案沟通"]');
    if (negotiateBtn) negotiateBtn.classList.add('active');
  }
  // 'my-schools' shows all - no filter needed

  // Trigger re-render if render function exists
  if (typeof renderSchoolList === 'function') {
    renderSchoolList(filter);
  }
}

/* ==================== Target Settings ==================== */

// 渲染目标进度（动态从后端取数据）
function renderTargetProgress(targetProgress) {
  console.log('[目标进度渲染] 接收到数据:', JSON.stringify(targetProgress));
  const container = document.getElementById('targetProgressContainer');
  const monthEl = document.getElementById('targetProgressMonth');
  console.log('[目标进度渲染] container:', !!container, 'monthEl:', !!monthEl);
  if (!container || !monthEl) return;

  // 更新月份显示
  const month = targetProgress?.month || '';
  if (month) {
    const parts = month.split('-');
    monthEl.textContent = `${parts[0]}年${parseInt(parts[1])}月`;
  }

  // 空态：无目标设置
  if (!targetProgress || !targetProgress.hasGoal) {
    container.innerHTML = `
      <div style="text-align:center; padding: 32px 0; color: #9ca3af;">
        <div style="margin-bottom: 12px;">暂无设置目标</div>
        <button class="btn btn-primary btn-sm" onclick="navigateToTargetSettings()">去设置</button>
      </div>
    `;
    return;
  }

  // 3个指标（名称、单位、颜色从后端目标配置读取）
  const indicators = targetProgress.indicators || [];

  // 如果所有指标目标都为0，也显示空态
  if (indicators.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 32px 0; color: #9ca3af;">
        <div style="margin-bottom: 12px;">暂无设置目标</div>
        <button class="btn btn-primary btn-sm" onclick="navigateToTargetSettings()">去设置</button>
      </div>
    `;
    return;
  }

  // 半圆弧长（r=50）：π * r
  const ARC_LEN = Math.PI * 50;

  const rings = indicators.map(ind => {
    const goal = Number(ind.goal) || 0;
    const completed = Number(ind.completed) || 0;
    const percent = goal > 0 ? Math.min(Math.round((completed / goal) * 100), 100) : 0;
    const offset = ARC_LEN * (1 - percent / 100);
    const unit = ind.unit || '';
    return `
      <div class="ring-item">
        <svg class="ring-svg" viewBox="0 0 120 72" role="img" aria-label="${ind.name} ${percent}%">
          <path class="ring-track" d="M10 64 A 50 50 0 0 1 110 64" />
          <path class="ring-fill" d="M10 64 A 50 50 0 0 1 110 64" style="stroke:${ind.color || '#2563eb'};stroke-dasharray:${ARC_LEN};stroke-dashoffset:${offset};" />
          <text class="ring-percent" x="60" y="56" text-anchor="middle">${percent}%</text>
        </svg>
        <div class="ring-name">${ind.name}</div>
        <div class="ring-value">${completed}/${goal}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="ring-grid">${rings}</div>`;
}

// 跳转到目标设置
function navigateToTargetSettings() {
  openTargetSettingsModal();
}

function openTargetSettingsModal() {
  openModal('targetSettingsModal');
}

async function saveTargetSettings() {
  const form = document.getElementById('targetSettingsForm');
  const inputs = form.querySelectorAll('input');
  const values = {};
  inputs.forEach((input, i) => {
    const label = input.closest('.form-group').querySelector('label').textContent;
    values[label] = input.value;
  });

  // 构建 API 数据
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 先检查是否已有当月目标
  const existingGoal = await API.getMonthlyGoal(month);
  const hasGoal = existingGoal && existingGoal.success === true && existingGoal.data;

  const goalData = {
    month: month,
    visit_goal: parseInt(values['拜访次数'] || '0'),
    new_school_goal: parseInt(values['签约学校数'] || '0'),
    signed_amount_goal: parseFloat(values['销售目标（元）'] || '0'),
  };

  if (hasGoal) {
    // 编辑模式：带上 isEdit、id 和 target_user_id
    goalData.isEdit = true;
    goalData.id = existingGoal.data.id;
    goalData.target_user_id = existingGoal.data.user_id;
  }

  console.log('[目标设置保存] month:', month, 'hasGoal:', !!hasGoal, 'goalData:', goalData);

  try {
    const result = await API.saveMonthlyGoal(goalData);
    console.log('[目标设置保存] 成功:', result);
    // 保存成功后刷新工作台数据
    await renderEmployeeDashboard();
  } catch (err) {
    console.error('[目标设置保存] 失败:', err);
  }

  closeModal('targetSettingsModal');
}

/* ==================== Modal ==================== */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
  // 打开弹窗时隐藏FAB
  const fabBtn = document.querySelector('.fab-button');
  if (fabBtn) fabBtn.style.display = 'none';
  // 打开新建学校弹窗时重置表单
  if (id === 'newSchoolModal') resetNewSchoolForm();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
  // 关闭弹窗时恢复FAB显示（仅限列表页）
  if (['dashboard', 'schoolList', 'records', 'workReportsList'].includes(currentPage)) {
    const fabBtn = document.querySelector('.fab-button');
    if (fabBtn) fabBtn.style.display = 'flex';
  }
  // 关闭新建学校弹窗时重置表单
  if (id === 'newSchoolModal') resetNewSchoolForm();
  // 关闭写跟进弹窗时关闭下拉框并重置编辑状态
  if (id === 'followUpModal') {
    closeSchoolDropdown('followUp');
    editingRecordId = null;
    // 重置标题和按钮文字
    const modalTitle = document.getElementById('followUpModalTitle');
    if (modalTitle) modalTitle.textContent = '写工作记录';
    const followUpModal = document.getElementById('followUpModal');
    const followUpSubmitBtn = followUpModal?.querySelector('.btn-primary');
    if (followUpSubmitBtn) followUpSubmitBtn.textContent = '提交';
  }
}

// ========== 手机端弹窗键盘适配 ==========
(function () {
  // 仅手机端生效
  if (window.innerWidth >= 768) return;

  const targetModals = ['newSchoolModal', 'followUpModal', 'viewRecordModal'];
  const scrollableModals = ['newSchoolModal', 'followUpModal'];

  document.addEventListener('focusin', function (e) {
    const target = e.target;
    if (!target || !(['input', 'textarea', 'select'].includes(target.tagName.toLowerCase()))) return;

    // 检查输入框是否在目标弹窗内
    let modal = target.closest('.modal-mask');
    if (!modal || !target.closest('.modal')) return;
    const modalId = modal.id;
    if (!targetModals.includes(modalId)) return;

    // 键盘弹出后延时滚动
    setTimeout(function () {
      // 优先尝试让输入框在 modal-body 中居中显示
      const body = modal.querySelector('.modal-body');
      if (body && scrollableModals.includes(modalId)) {
        const bodyRect = body.getBoundingClientRect();
        const inputRect = target.getBoundingClientRect();
        // 计算输入框相对于 body 的顶部位置
        const inputTopInBody = inputRect.top - bodyRect.top + body.scrollTop;
        const targetScroll = inputTopInBody - bodyRect.height / 3;
        body.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    }, 300);
  });
})();

// ========== 可搜索学校下拉框 ==========
// 当前活动的下拉框状态
const schoolDropdownState = {
  followUp: { activeIndex: -1, filtered: [] }
};

function openSchoolDropdown(key) {
  const dropdown = document.getElementById(key + 'SchoolDropdown');
  const container = document.getElementById(key + 'SchoolContainer');
  // 检查是否被锁定
  if (container && container.getAttribute('data-locked') === 'true') {
    return;
  }
  const trigger = document.querySelector('#' + key + 'SchoolContainer .school-search-trigger');
  const list = dropdown.querySelector('.school-search-list');
  const filter = dropdown.querySelector('.school-search-filter');
  const state = schoolDropdownState[key];

  // 关闭其他下拉框
  Object.keys(schoolDropdownState).forEach(k => {
    if (k !== key) closeSchoolDropdown(k);
  });

  // 获取当前已选值
  const currentValue = document.getElementById(key + 'SchoolValue').value;

  // 获取学校列表
  const schools = schoolsData;
  state.filtered = schools.map(s => s.name);
  renderSchoolDropdownList(key, state.filtered);
  dropdown.style.display = 'block';
  state.activeIndex = -1;

  // 100ms 后聚焦搜索框并选中已有文本
  setTimeout(() => {
    filter.value = currentValue || '';
    filter.focus();
    if (currentValue) filter.select();
  }, 50);

  // 绑定键盘事件
  dropdown._keydownHandler = (e) => schoolDropdownKeydown(e, key);
  dropdown.addEventListener('keydown', dropdown._keydownHandler);
}

function closeSchoolDropdown(key) {
  const dropdown = document.getElementById(key + 'SchoolDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
    if (dropdown._keydownHandler) {
      dropdown.removeEventListener('keydown', dropdown._keydownHandler);
      dropdown._keydownHandler = null;
    }
  }
  schoolDropdownState[key].activeIndex = -1;
}

function filterSchoolDropdown(key, keyword) {
  const state = schoolDropdownState[key];
  const list = document.getElementById(key + 'SchoolDropdown').querySelector('.school-search-list');

  const schools = schoolsData;

  if (!keyword.trim()) {
    state.filtered = schools.map(s => s.name);
  } else {
    state.filtered = schools
      .filter(s => s.name.includes(keyword))
      .map(s => s.name);
  }

  state.activeIndex = -1;
  renderSchoolDropdownList(key, state.filtered);
}

function renderSchoolDropdownList(key, schools) {
  const list = document.getElementById(key + 'SchoolDropdown').querySelector('.school-search-list');
  const currentValue = document.getElementById(key + 'SchoolValue').value;

  if (schools.length === 0) {
    list.innerHTML = '<div class="school-search-no-match">暂无匹配的学校</div>';
    return;
  }

  list.innerHTML = schools.map((name, i) => {
    const isActive = i === schoolDropdownState[key].activeIndex;
    const isSelected = name === currentValue;
    let cls = 'school-search-item';
    if (isActive) cls += ' active';
    return `<div class="${cls}" onclick="selectSchool('${key}', '${name}')" data-index="${i}">${name}${isSelected ? ' <small style="color:#3b82f6">(已选)</small>' : ''}</div>`;
  }).join('');
}

function selectSchool(key, name) {
  const trigger = document.querySelector('#' + key + 'SchoolContainer .school-search-trigger');
  const hidden = document.getElementById(key + 'SchoolValue');

  trigger.value = name;
  hidden.value = name;

  closeSchoolDropdown(key);

  // 选中学校后联动更新"跟进后状态"可选项
  if (key === 'followUp') {
    onFollowUpSchoolSelected(name);
  }
}

function schoolDropdownKeydown(e, key) {
  const state = schoolDropdownState[key];
  const list = document.getElementById(key + 'SchoolDropdown').querySelector('.school-search-list');
  const items = list.querySelectorAll('.school-search-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (items.length === 0) return;
    state.activeIndex = Math.min(state.activeIndex + 1, items.length - 1);
    updateActiveItem(key, items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (items.length === 0) return;
    state.activeIndex = Math.max(state.activeIndex - 1, 0);
    updateActiveItem(key, items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (state.activeIndex >= 0 && items[state.activeIndex]) {
      const name = items[state.activeIndex].textContent.replace('(已选)', '').trim();
      selectSchool(key, name);
    }
  } else if (e.key === 'Escape') {
    closeSchoolDropdown(key);
  }
}

function updateActiveItem(key, items) {
  const state = schoolDropdownState[key];
  items.forEach((item, i) => {
    item.classList.toggle('active', i === state.activeIndex);
  });

  // 滚动到可见区域
  if (items[state.activeIndex]) {
    items[state.activeIndex].scrollIntoView({ block: 'nearest' });
  }
}

// 全局点击关闭下拉框
document.addEventListener('click', function(e) {
  // 检查是否点击在校历搜索区域
  if (!e.target.closest('.school-search-container')) {
    closeSchoolDropdown('followUp');
    closeSchoolDropdown('opLog');
  }
});

// 重置新建学校表单
function resetNewSchoolForm() {
  matchedSchool = null;
  isManualMode = false;

  document.getElementById('newSchoolName').value = '';
  initNewSchoolProvinceOptions();
  document.getElementById('newSchoolProvince').value = '';
  document.getElementById('newSchoolProvince').disabled = true;
  document.getElementById('newSchoolCity').innerHTML = '<option value="">请选择城市</option>';
  document.getElementById('newSchoolCity').disabled = true;
  document.getElementById('newSchoolLevel').value = '';
  document.getElementById('newSchoolLevel').disabled = true;
  document.getElementById('newSchoolType').value = '';
  document.getElementById('newSchoolType').disabled = true;

  document.getElementById('schoolSearchDropdown').style.display = 'none';
  document.getElementById('schoolNoMatchHint').style.display = 'none';
  document.getElementById('selectedSchoolHint').style.display = 'none';
  document.getElementById('schoolExtraFields').style.display = 'none';
}

// 打开写工作记录弹窗（默认新建模式，传入record则进入编辑模式）
// 状态流转顺序
const STATUS_FLOW = ['初步接触', '有意向', '方案沟通', '已签约', '运营中', '已到期'];
const NON_PHASE_STATUS = ['暂停中', '终止推进'];

/**
 * 根据学校当前状态生成"跟进后状态"下拉可选项
 * @param {string} currentStatus 学校当前状态
 * @param {string} selectedValue 编辑时预选中值
 */
function generateFollowUpStatusOptions(currentStatus, selectedValue) {
  const sel = document.getElementById('followUpStatusAfter');
  if (!sel) return;
  let html = '<option value="">保持当前状态</option>';

  // 暂停中/终止推进也允许选择
  html += '<option value="暂停中">暂停中</option>';
  html += '<option value="终止推进">终止推进</option>';

  // 如果当前状态在主流程里，给"下一阶段"选项
  const curIdx = STATUS_FLOW.indexOf(currentStatus);
  if (curIdx >= 0 && curIdx < STATUS_FLOW.length - 1) {
    const next = STATUS_FLOW[curIdx + 1];
    html += `<option value="${next}">推进到：${next}（下一阶段）</option>`;
  }

  sel.innerHTML = html;
  if (selectedValue) sel.value = selectedValue;
}

/**
 * 扫描内容关键词，返回智能建议的目标状态
 */
function scanStatusHint(content) {
  const c = (content || '').toLowerCase();
  if (/签约|签订|合同|已签/.test(c)) return '已签约';
  if (/暂停|暂缓|搁置/.test(c)) return '暂停中';
  if (/终止|放弃|不合作|流失|不再合作|停止/.test(c)) return '终止推进';
  return null;
}

function openFollowUpModal(record) {
  // 关闭可能存在的下拉框
  if (schoolDropdownState.followUp) {
    schoolDropdownState.followUp.activeIndex = -1;
  }
  closeSchoolDropdown('followUp');

  const trigger = document.querySelector('#followUpSchoolContainer .school-search-trigger');
  const hidden = document.getElementById('followUpSchoolValue');
  const textarea = document.querySelector('#followUpModal .form-textarea');
  const nextStepInput = document.getElementById('followUpNextStep');

  // 学校锁定状态控制
  const schoolContainer = document.getElementById('followUpSchoolContainer');
  let schoolLocked = false;

  if (record && record.id) {
    // 编辑模式：回填数据，学校字段锁定
    editingRecordId = record.id;
    schoolLocked = true;
    lockedSchoolId = record.school_id || null;
    document.getElementById('followUpModalTitle').textContent = '编辑工作记录';
    const followUpModal = document.getElementById('followUpModal');
    const followUpSubmitBtn = followUpModal.querySelector('.btn-primary');
    if (followUpSubmitBtn) followUpSubmitBtn.textContent = '保存';

    // 回填学校名称
    const schoolName = record.school || record.school_name || '';
    if (trigger) trigger.value = schoolName;
    if (hidden) hidden.value = schoolName;

    // 回填内容
    if (textarea) textarea.value = record.content || '';

    // 回填下一步计划
    if (nextStepInput) nextStepInput.value = record.next_step || '';

    // 动态生成状态下拉（用记录的学校当前状态）
    const sch = schoolsData.find(s => s.name === schoolName || s.id === record.school_id);
    generateFollowUpStatusOptions(sch ? sch.status : null, record.status_after || '');
  } else if (record && record.schoolId) {
    // 从学校列表行进入，预填并锁定学校
    editingRecordId = null;
    schoolLocked = true;
    lockedSchoolId = record.schoolId;
    document.getElementById('followUpModalTitle').textContent = '写工作记录';
    const followUpModal = document.getElementById('followUpModal');
    const followUpSubmitBtn = followUpModal.querySelector('.btn-primary');
    if (followUpSubmitBtn) followUpSubmitBtn.textContent = '提交';

    if (trigger) trigger.value = record.schoolName || '';
    if (hidden) hidden.value = record.schoolName || '';
    if (textarea) textarea.value = '';
    if (nextStepInput) nextStepInput.value = '';

    // 根据学校ID找到学校，更新状态下拉
    const sch = schoolsData.find(s => s.id === record.schoolId);
    generateFollowUpStatusOptions(sch ? sch.status : null, '');
  } else {
    // 新建模式（FAB/顶部入口）：清空表单，学校可选
    editingRecordId = null;
    lockedSchoolId = null;
    schoolLocked = false;
    document.getElementById('followUpModalTitle').textContent = '写工作记录';
    const followUpModal = document.getElementById('followUpModal');
    const followUpSubmitBtn = followUpModal.querySelector('.btn-primary');
    if (followUpSubmitBtn) followUpSubmitBtn.textContent = '提交';

    if (trigger) trigger.value = '';
    if (hidden) hidden.value = '';
    if (textarea) textarea.value = '';
    if (nextStepInput) nextStepInput.value = '';

    // 新建模式先用空状态占位，等用户选学校后再更新
    generateFollowUpStatusOptions(null, '');
  }

  // 设置学校字段锁定/可编辑状态
  if (schoolLocked) {
    if (trigger) {
      trigger.readOnly = true;
      trigger.style.cursor = 'default';
      trigger.style.backgroundColor = '#f3f4f6';
    }
    if (schoolContainer) schoolContainer.setAttribute('data-locked', 'true');
  } else {
    if (trigger) {
      trigger.readOnly = false;
      trigger.style.cursor = '';
      trigger.style.backgroundColor = '';
    }
    if (schoolContainer) schoolContainer.removeAttribute('data-locked');
  }

  // 隐藏错误信息
  const errorDiv = document.getElementById('followUpError');
  if (errorDiv) errorDiv.textContent = '';

  openModal('followUpModal');
}

// 工作台/详情页"写工作记录"按钮入口，复用 followUpModal
function openWorkRecordModal(schoolName) {
  // 新建模式，打开空表单
  openFollowUpModal(null);
  // 如果传入了学校名称，回填到表单
  if (schoolName) {
    const trigger = document.querySelector('#followUpSchoolContainer .school-search-trigger');
    const hidden = document.getElementById('followUpSchoolValue');
    if (trigger) trigger.value = schoolName;
    if (hidden) hidden.value = schoolName;
    // 同步更新状态下拉
    const sch = schoolsData.find(s => s.name === schoolName);
    if (sch) generateFollowUpStatusOptions(sch.status, '');
  }
}

/**
 * 学校下拉选择后，同步更新"跟进后状态"可选项
 */
function onFollowUpSchoolSelected(schoolName) {
  const sch = schoolsData.find(s => s.name === schoolName);
  generateFollowUpStatusOptions(sch ? sch.status : null, '');
}

/* ==================== Detail Tab Switch ==================== */

// Track which tabs have been loaded to avoid repeated API calls
const detailTabLoaded = { workRecords: false, contracts: false, devices: false, logs: false };

function switchDetailTab(el, tabName) {
  // Update tab buttons
  el.parentElement.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
  el.classList.add('active');

  // Update tab content visibility
  document.querySelectorAll('.detail-tab-content').forEach(content => content.style.display = 'none');
  const target = document.getElementById('detail-' + tabName);
  if (target) target.style.display = 'block';

  // Load data for the selected tab if not already loaded
  if (!detailTabLoaded[tabName] && currentSchoolId) {
    detailTabLoaded[tabName] = true;
    const loadFn = {
      workRecords: loadFollowRecords,
      contracts: loadSchoolContracts,
      devices: loadSchoolDevices,
      logs: loadSchoolLogs,
    }[tabName];
    if (loadFn) loadFn(currentSchoolId);
  }
}

/* ==================== Detail Tab Data Loading ==================== */

async function loadFollowRecords(schoolId) {
  const container = document.getElementById('followUpTimeline');
  if (!container) return;

  try {
    const res = await API.getSchoolWorkRecords(schoolId);
    const records = (res && res.data) || res || [];
    const list = Array.isArray(records) ? records : [];

    if (list.length === 0) {
      container.classList.add('timeline-empty');
      container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#9ca3af;">暂无工作记录</div>';
      return;
    }

    container.classList.remove('timeline-empty');

    // 从记录快照显示状态（不跟随学校状态变化）
    const hasRecordStatus = list.some(r => r.record_status);
    const statusNoteHtml = hasRecordStatus
      ? '<span class="record-badge" style="margin-right: 10px; font-size: 11px;">状态说明：提交时快照</span>'
      : '';

    container.innerHTML = list.map(r => {
      const recordStatus = r.school_status || null;
      const statusBadgeHtml = recordStatus
        ? `<span class="timeline-status-badge badge ${getStatusBadge(recordStatus)}">${recordStatus}</span>`
        : '';
      const nextStepHtml = r.next_step
        ? `<div class="timeline-next-step">下一步：${r.next_step}</div>`
        : '';
      return `
        <div class="timeline-item">
          <div class="timeline-header">
            <div class="timeline-header-left">
              <span class="timeline-operator">${r.user_name || r.user || r.operator || '-'}</span>
              ${statusBadgeHtml}
            </div>
            <span class="timeline-time">${r.created_at || r.time || '-'}</span>
          </div>
          <div class="timeline-body">${r.content || r.description || '-'}</div>
          ${nextStepHtml}
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load work records:', e);
    container.classList.add('timeline-empty');
    container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#ef4444;">加载失败</div>';
  }
}

async function loadSchoolContracts(schoolId) {
  const tbody = document.getElementById('contractTableBody');
  if (!tbody) return;

  try {
    const res = await API.getSchoolContracts(schoolId);
    const contracts = (res && res.data) || res || [];
    const list = Array.isArray(contracts) ? contracts : [];

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#9ca3af;">暂无合同信息</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td>${c.contract_no || c.id || '-'}</td>
        <td>${c.sign_date || c.created_at || '-'}</td>
        <td>${c.file_url ? `<span class="text-link">${c.file_url || '查看文件'}</span>` : '-'}</td>
        <td>${c.notes || '-'}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load contracts:', e);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#ef4444;">加载失败</td></tr>';
  }
}

async function loadSchoolDevices(schoolId) {
  const tbody = document.getElementById('deviceDeploymentTableBody');
  if (!tbody) return;

  try {
    const res = await API.getSchoolDevicePlacements(schoolId);
    const devices = (res && res.data) || res || [];
    const list = Array.isArray(devices) ? devices : [];

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#9ca3af;">暂无设备投放记录</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(d => {
      const statusMap = {
        '已投放': 'badge-green',
        '待投放': 'badge-yellow',
        '投放中': 'badge-blue',
      };
      const statusClass = statusMap[d.status] || 'badge-gray';
      return `
        <tr>
          <td>${d.deploy_date || d.created_at || '-'}</td>
          <td>${d.device_type || '-'}</td>
          <td>${d.quantity ? d.quantity + '台' : '-'}</td>
          <td><span class="badge ${statusClass}">${d.status || '-'}</span></td>
          <td>${d.user_name || d.user || d.operator || '-'}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load device placements:', e);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#ef4444;">加载失败</td></tr>';
  }
}

async function loadSchoolLogs(schoolId) {
  const tbody = document.getElementById('schoolDetailLogsBody');
  if (!tbody) return;

  try {
    const res = await API.getSchoolLogs(schoolId);
    const logs = (res && res.data) || res || [];
    const list = Array.isArray(logs) ? logs : [];

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#9ca3af;">暂无操作日志</td></tr>';
      return;
    }

    // 根据 logType 渲染标签
    function renderBadge(logType) {
      const map = {
        create:        ['创建学校',   'green'],
        status_flow:   ['状态流程',   'blue'],
        work_record:   ['写工作记录', 'gray'],
        contract:      ['上传合同',   'gray'],
        contact:       ['联系人',     'orange'],
        device:        ['设备投放',   'cyan'],
      };
      const [label, color] = map[logType] || ['其他', 'gray'];
      return `<span class="badge badge-${color}">${label}</span>`;
    }

    // 格式化 detail 内容
    function formatDetail(log) {
      const { logType, detail } = log;
      if (!detail) return '-';

      switch (logType) {
        case 'create':
          return `创建了：${detail}`;
        case 'status_flow':
          // detail 就是 type (状态推进/暂停推进/恢复推进等)
          // content 已在后端作为 detail 返回
          if (detail.includes('->')) {
            return `状态推进：${detail}`;
          }
          return detail;
        case 'work_record':
          return `工作记录：${detail}`;
        default:
          return detail;
      }
    }

    tbody.innerHTML = list.map(l => `
      <tr>
        <td>${l.created_at || '-'}</td>
        <td>${l.user_name || '-'}</td>
        <td>${renderBadge(l.logType)}</td>
        <td>${formatDetail(l)}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load logs:', e);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#ef4444;">加载失败</td></tr>';
  }
}

/* ==================== Record Tab Switch ==================== */

// 初始化记录管理页面的 Tab 显示（根据角色控制）
function initRecordsTabs() {
  const tabBar = document.getElementById('recordsTabBar');
  if (!tabBar) return;

  // 员工不显示 Tab 切换，负责人和超级管理员显示
  if (currentUser.role === '员工') {
    tabBar.style.display = 'none';
  } else {
    tabBar.style.display = 'flex';
  }

  // 渲染工作记录表格数据
  renderRecordsTable();
}

function switchRecordTab(el, tabName) {
  el.parentElement.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
  el.classList.add('active');

  const recordsBody = document.getElementById('records-tbody');
  if (!recordsBody) return;

  let list;
  if (tabName === 'all') {
    list = recordsData;
  } else if (tabName === 'sales') {
    list = recordsData;
  } else if (tabName === 'operator') {
    list = recordsData;
  } else {
    list = recordsData;
  }

  recordsBody.innerHTML = list.map(r => {
    const schoolStatus = r.school_status || '-';
    return `
    <tr>
      <td>${r.time}</td>
      <td><span class="text-link" onclick="showView('schoolDetail', null); showSchoolDetail(${r.school_id})">${r.school}</span></td>
      <td><span class="badge ${getStatusBadge(schoolStatus)}">${schoolStatus}</span></td>
      <td><span class="badge ${r.type === '销售记录' ? 'badge-blue' : 'badge-purple'}">${r.type}</span></td>
      <td>${r.user}</td>
      <td>${r.content}</td>
      <td><div class="record-next-step">${r.next_step || '-'}</div></td>
    </tr>
  `;
  }).join('');
}

/* ==================== School Detail ==================== */

function showSchoolDetail(schoolId) {
  currentSchoolId = schoolId;
  // Find the school from the schools array
  const school = schoolsData.find(s => s.id === schoolId);
  if (!school) return;

  const statusFlow = ['初步接触', '有意向', '方案沟通', '已签约', '运营中', '已到期'];

  // Initialize schoolDetail object
  schoolDetail = {
    id: school.id,
    name: school.name,
    status: school.status,
    statusIndex: statusFlow.indexOf(school.status),
    statusFlow: statusFlow,
    paused: school.status === '暂停中',
    pausedFrom: school.paused_from || null,
    pausedIndex: school.paused_from ? statusFlow.indexOf(school.paused_from) : -1,
    dept: school.dept,
    region: school.region,
    grade: school.grade,
    sales: school.sales,
    operator: school.operator,
    operator_id: school.operator_id,
    operator_ids: school.operator_ids,
  };

  // Update operator display
  const detailOperator = document.getElementById('detailOperator');
  if (detailOperator) {
    const opNames = getOperatorNames(school);
    if (opNames) {
      const nameArr = opNames.split('、');
      detailOperator.innerHTML = renderPersonTags(nameArr);
    } else {
      detailOperator.textContent = '-';
    }
  }

  // Update HTML elements
  const breadcrumbName = document.getElementById('detailBreadcrumbName');
  if (breadcrumbName) breadcrumbName.textContent = school.name;

  const title = document.getElementById('detailTitle');
  if (title) title.textContent = school.name;

  const meta = document.getElementById('detailMeta');
  if (meta) meta.innerHTML = `创建时间：${school.created_at || '-'} · 销售人员：${renderPersonTags([school.sales])}`;

  const schoolName = document.getElementById('detailSchoolName');
  if (schoolName) schoolName.textContent = school.name;

  const dept = document.getElementById('detailDept');
  if (dept) dept.textContent = school.dept;

  const region = document.getElementById('detailRegion');
  if (region) region.textContent = school.region;

  const grade = document.getElementById('detailGrade');
  if (grade) grade.textContent = school.grade;

  const type = document.getElementById('detailType');
  if (type) type.textContent = school.type || '-';

  // Show the detail view
  showView('schoolDetail', null);

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const schoolNav = document.querySelector('[data-view="schoolList"]');
  if (schoolNav) schoolNav.classList.add('active');

  // Render dynamic content
  renderStatusFlow();
  updateSchoolStatusBadge();
  updateFlowButtonsVisibility();
  updateDetailButtonsVisibility();

  // Reset tab loaded flags and load default tab (follow-ups)
  Object.keys(detailTabLoaded).forEach(key => detailTabLoaded[key] = false);
  loadFollowRecords(schoolId);
  detailTabLoaded.workRecords = true;
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
    const filtered = schoolsData.filter(s => s.operator === '孙七');
    renderSchoolsTable(filtered);
  }
}

/* ==================== Status Badge Helper ==================== */

function getStatusBadge(status) {
  const map = {
    '初步接触': 'badge-gray',
    '有意向': 'badge-blue',
    '方案沟通': 'badge-orange',
    '已签约': 'badge-green',
    '运营中': 'badge-cyan',
    '已到期': 'badge-gray',
    '暂停中': 'badge-yellow',
    '终止推进': 'badge-red',
  };
  return map[status] || 'badge-gray';
}

/* ==================== Render Functions ==================== */

function renderRecordsTable(data) {
  const tbody = document.getElementById('records-tbody');
  if (tbody) {
    const list = data || recordsData;
    tbody.innerHTML = list.map(r => {
      const timeStr = r.time || '';
      const shortTime = timeStr.length >= 16 ? timeStr.slice(0, 16).replace('T', ' ').replace(/[-:]$/, '') : timeStr;
      const schoolStatus = r.school_status || '-';
      return `
        <tr>
          <td>${shortTime}</td>
          <td><span class="text-link" onclick="showSchoolDetail(${r.school_id})">${r.school}</span></td>
          <td><span class="badge ${getStatusBadge(schoolStatus)}">${schoolStatus}</span></td>
          <td><div class="record-cell-text">${r.content}</div></td>
          <td><div class="record-cell-text">${r.next_step || '-'}</div></td>
          <td>${r.user || '-'}</td>
        </tr>
      `;
    }).join('');
  }
  renderMobileRecordsCards(data);
}

function renderSchoolsTable(data) {
  const tbody = document.getElementById('schools-tbody');
  if (tbody) {
    const list = data || schoolsData;
    tbody.innerHTML = list.map(s => `
      <tr>
        <td><span class="text-link" onclick="showSchoolDetail(${s.id})">${s.name}</span></td>
        <td>${s.dept}</td>
        <td>${s.region}</td>
        <td><span class="badge ${getStatusBadge(s.status)}">${s.status}</span></td>
        <td>${renderPersonTags(s.sales)}</td>
        <td>${renderPersonTags(getOperatorNames(s))}</td>
        <td>${s.last_follow_at ? s.last_follow_at.replace('T', ' ').slice(0, 16) : '暂无跟进'}</td>
        <td>${s.created_at ? s.created_at.replace('T', ' ').slice(0, 16) : '-'}</td>
        <td>
          <span class="text-link" onclick="showSchoolDetail(${s.id})">详情</span>
          <span style="margin: 0 4px; color: #e2e8f0;">|</span>
          <span class="text-link" onclick="openFollowUpModal({schoolId: ${s.id}, schoolName: '${s.name.replace(/'/g, "\\'")}'})">写工作记录</span>
          ${currentUser.role === '超级管理员' ? `
            <span style="margin: 0 4px; color: #e2e8f0;">|</span>
            <span class="text-link" style="color: #dc2626;" onclick="deleteSchool(${s.id}, '${s.name.replace(/'/g, "\\'")}')">删除</span>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }
  renderMobileSchoolCards(data);
}

/* ==================== 移动端交互 ==================== */

// 移动端筛选状态
var currentMobileStatus = '';
var currentMobileSchoolSearch = '';
var currentMobileRecordsSearch = '';
var currentMobileDateStart = '';
var currentMobileDateEnd = '';

// 状态chips点击
function selectMobileStatus(el) {
  var chips = document.getElementById('mobileStatusChips');
  if (chips) chips.querySelectorAll('.status-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentMobileStatus = el.getAttribute('data-status') || '';
  applyMobileSchoolFilter();
}

// 移动端学校筛选
function applyMobileSchoolFilter() {
  var filtered = schoolsData.filter(s => {
    if (currentMobileStatus && s.status !== currentMobileStatus) return false;
    if (currentMobileSchoolSearch && !s.name.includes(currentMobileSchoolSearch)) return false;
    return true;
  });
  renderMobileSchoolCards(filtered);
  renderSchoolsTable(filtered);
}

// 移动端学校搜索
function mobileSchoolSearch() {
  var input = document.getElementById('mobileSchoolSearchInput');
  currentMobileSchoolSearch = input ? input.value.trim() : '';
  applyMobileSchoolFilter();
}

// 移动端工作记录筛选切换
function toggleMobileRecordsFilter() {
  var filter = document.getElementById('mobileDateFilter');
  if (filter) filter.style.display = filter.style.display === 'none' ? 'block' : 'none';
}

// 移动端日期筛选应用
function applyMobileDateFilter() {
  var startEl = document.getElementById('mobileDateStart');
  var endEl = document.getElementById('mobileDateEnd');
  if (startEl) currentMobileDateStart = startEl.value;
  if (endEl) currentMobileDateEnd = endEl.value;
  applyMobileRecordsFilter();
}

// 移动端工作记录筛选
function applyMobileRecordsFilter() {
  var filtered = recordsData.filter(r => {
    if (currentMobileRecordsSearch && !r.school.includes(currentMobileRecordsSearch) && !r.content.includes(currentMobileRecordsSearch)) return false;
    if (currentMobileDateStart && r.time < currentMobileDateStart) return false;
    if (currentMobileDateEnd && r.time > currentMobileDateEnd + 'T23:59:59') return false;
    return true;
  });
  renderMobileRecordsCards(filtered);
  renderRecordsTable(filtered);
}

// 移动端工作记录搜索
function mobileRecordsSearch() {
  var input = document.getElementById('mobileRecordsSearchInput');
  currentMobileRecordsSearch = input ? input.value.trim() : '';
  applyMobileRecordsFilter();
}

// 渲染移动端学校卡片
function renderMobileSchoolCards(data) {
  var container = document.getElementById('mobileSchoolCardList');
  if (!container) return;
  var list = data || schoolsData;
  container.innerHTML = list.map(s => `
    <div class="mobile-school-card" onclick="showSchoolDetail(${s.id})">
      <div class="mobile-school-card-header">
        <span class="mobile-school-card-name">${s.name}</span>
        <span class="mobile-school-card-status badge ${getStatusBadge(s.status)}">${s.status}</span>
      </div>
      <div class="mobile-school-card-meta">
        <span>销售：${renderPersonTags(s.sales)}</span>
        <span>运营：${renderPersonTags(getOperatorNames(s))}</span>
        <span>部门：${s.dept || '-'}</span>
      </div>
      <div class="mobile-school-card-meta">
        <span>跟进：${s.last_follow_at ? s.last_follow_at.replace('T', ' ').slice(0, 16) : '暂无跟进'}</span>
        <span>创建：${s.created_at ? s.created_at.replace('T', ' ').slice(0, 16) : '-'}</span>
      </div>
    </div>
  `).join('');
}

// 渲染移动端工作记录卡片
function renderMobileRecordsCards(data) {
  var container = document.getElementById('mobileRecordsCardList');
  if (!container) return;
  var list = data || recordsData;
  container.innerHTML = list.map(r => {
    const timeStr = r.time || '';
    const shortTime = timeStr.length >= 16 ? timeStr.slice(0, 10) : timeStr;
    const schoolStatus = r.record_status || r.school_status || '-';
    return `
      <div class="mobile-records-card" onclick="handleMobileRecordClick(${r.id})">
        <div class="mobile-records-card-header">
          <span class="mobile-records-card-school">${r.school}</span>
          <span class="badge ${getStatusBadge(schoolStatus)}">${schoolStatus}</span>
        </div>
        <div class="mobile-records-card-content">${r.content}</div>
        ${r.next_step ? `<div class="mobile-records-card-next-step">下一步计划：${r.next_step}</div>` : ''}
        <div class="mobile-records-card-footer">提交人：${r.user || '-'} · ${shortTime}</div>
      </div>
    `;
  }).join('');
}

// 手机端点击记录卡片→查看详情（只读）
function handleMobileRecordClick(recordId) {
  var record = recordsData.find(function(r) { return r.id === recordId; });
  if (record) {
    viewRecordModal(record);
  }
}

// 工作记录详情查看（只读）
function viewRecordModal(record) {
  document.getElementById('viewRecordSchool').textContent = record.school || '-';
  document.getElementById('viewRecordContent').textContent = record.content || '-';
  document.getElementById('viewRecordStatus').textContent = record.record_status || '-';
  document.getElementById('viewRecordNextStep').textContent = record.next_step || '-';
  document.getElementById('viewRecordUser').textContent = record.user || '-';
  document.getElementById('viewRecordTime').textContent = record.time || '-';
  openModal('viewRecordModal');
}

// 填充个人信息
function fillProfileInfo() {
  if (!currentUser) return;
  var avatar = document.getElementById('profileAvatar');
  var name = document.getElementById('profileName');
  var role = document.getElementById('profileRole');
  var dept = document.getElementById('profileDept');
  if (avatar) avatar.textContent = (currentUser.name || '张')[0];
  if (name) name.textContent = currentUser.name || '张三';
  if (role) role.textContent = currentUser.role || '超级管理员';
  if (dept) dept.textContent = currentUser.dept || '华东区';
}

// ==================== 移动端右上角用户头像 ====================
function initMobileUserHeader() {
  if (!currentUser) return;
  var name = currentUser.name || '';
  var role = currentUser.role || '';
  var dept = currentUser.dept || '';
  var initial = name ? name.charAt(0) : '?';

  // 注入到每个 topbar（仅移动端显示，PC 端隐藏）
  document.querySelectorAll('.topbar').forEach(function (topbar) {
    if (topbar.querySelector('.mobile-user-header')) return;
    var el = document.createElement('div');
    el.className = 'mobile-user-header';
    el.setAttribute('onclick', 'toggleMobileUserDropdown()');
    el.innerHTML =
      '<div class="mobile-user-header-avatar">' + initial + '</div>' +
      '<div class="mobile-user-header-name">' + name + '</div>';
    topbar.appendChild(el);
  });

  // 填充下拉菜单信息
  var setText = function (id, val) {
    var node = document.getElementById(id);
    if (node) node.textContent = val || '';
  };
  setText('mobileDropdownAvatar', initial);
  setText('mobileDropdownName', name);
  setText('mobileDropdownMeta', role && dept ? role + ' · ' + dept : (role || dept));
  setText('mobileDropdownRole', role);
  setText('mobileDropdownDept', dept);
}

function toggleMobileUserDropdown() {
  var dd = document.getElementById('mobileUserDropdown');
  if (!dd) return;
  dd.classList.toggle('show');
}

function closeMobileUserDropdown() {
  var dd = document.getElementById('mobileUserDropdown');
  if (dd) dd.classList.remove('show');
}

// 修改密码
function changePassword() {
  showToast('请使用"设置"中修改登录密码', 'info');
}

// 退出登录
function handleLogout() {
  localStorage.removeItem('crm_user');
  location.reload();
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

/* ==================== 学校删除 ==================== */

async function deleteSchool(schoolId, schoolName) {
  openConfirmModal(`确定要删除"${schoolName}"吗？删除后不可恢复`, async (confirmed) => {
    if (!confirmed) return;
    try {
      const res = await API.deleteSchool(schoolId);
      if (res.success) {
        showToast(`"${schoolName}"已删除`, 'success');
        await loadData();
      } else {
        showToast(res.message || '删除失败', 'error');
      }
    } catch (err) {
      showToast('删除失败：' + err.message, 'error');
    }
  }, 'danger');
}

/* ==================== 基础交互函数 ==================== */

function handleLogout() {
  openConfirmModal('确定要退出登录吗？', (confirmed) => {
    if (confirmed) {
      showToast('已退出登录', 'info');
      API.logout();
    }
  }, 'info');
}

let currentSchoolFilter = '全部';
let currentDeptFilter = '';
let currentSalesFilter = '';

/**
 * Tab 显示名 → 数据库实际状态值的映射
 */
const tabToDbStatus = {
  '全部': null,
  '初步接触': '初步接触',
  '有意向': '有意向',
  '方案沟通': '方案沟通',
  '已签约': '已签约',
  '运营中': '运营中',
  '已到期': '已到期',
  '暂停中': '暂停中',
  '已终止': '终止推进',
};

/**
 * 渲染状态 Tab（从后端 stats 接口获取真实数量）
 */
async function renderSchoolTabs(stats) {
  const container = document.getElementById('school-status-tabs');
  if (!container) return;

  const tabOrder = ['全部', '初步接触', '有意向', '方案沟通', '已签约', '运营中', '已到期', '暂停中', '已终止'];
  container.innerHTML = tabOrder.map(tab => {
    const count = stats[tab] || 0;
    const active = tab === currentSchoolFilter ? 'active' : '';
    return `<div class="tab-item ${active}" onclick="filterSchoolsByStatus('${tab}')">${tab}(${count})</div>`;
  }).join('');
}

/**
 * 统一的筛选函数：同时应用状态、部门、销售和搜索关键词
 */
function applySchoolFilters() {
  const keyword = document.getElementById('schoolsTableInput')?.value?.trim() || '';
  const dept = document.getElementById('schoolDeptFilter')?.value || '';
  const sales = document.getElementById('schoolSalesFilter')?.value || '';

  let filtered = schoolsData;

  // 状态筛选：使用 tabToDbStatus 映射数据库值
  const dbStatus = tabToDbStatus[currentSchoolFilter];
  if (dbStatus !== null) {
    filtered = filtered.filter(s => s.status === dbStatus);
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

/**
 * 点击状态 Tab：调用后端接口按状态筛选，更新 Tab 数量和列表
 */
async function filterSchoolsByStatus(tabName) {
  currentSchoolFilter = tabName;
  const dbStatus = tabToDbStatus[tabName];

  try {
    // 调用后端接口获取筛选数据
    const params = {};
    if (dbStatus !== null) {
      params.status = dbStatus;
    }
    const res = await API.getSchools(params);
    if (res && res.success === true) {
      schoolsData = (res.data || []).map(s => ({
        ...s,
        sales: s.sales_name || '-',
        operator: s.operator_name || '-',
      }));
    }

    // 更新 Tab 高亮
    document.querySelectorAll('#school-status-tabs .tab-item').forEach(item => {
      const text = item.textContent.trim().split('(')[0];
      item.classList.toggle('active', text === tabName);
    });

    // 应用其他筛选条件（部门、销售、关键词）
    applySchoolFilters();
    showToast(`筛选"${tabName}"，共 ${schoolsData.length} 所学校`, 'info');
  } catch (e) {
    console.error('筛选学校失败:', e);
    showToast('筛选失败', 'error');
  }
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
 * 导出当前筛选条件下的学校列表为 Excel
 */
async function exportSchoolList() {
  const btn = document.getElementById('schoolExportBtn');
  if (!btn || btn.disabled) return;

  // 收集当前筛选参数（与列表筛选一致）
  const keyword = document.getElementById('schoolsTableInput')?.value?.trim() || '';
  const dept = document.getElementById('schoolDeptFilter')?.value || '';
  const sales = document.getElementById('schoolSalesFilter')?.value || '';
  const dbStatus = tabToDbStatus[currentSchoolFilter];

  const params = {};
  if (dbStatus !== null) params.status = dbStatus;
  if (dept) params.dept = dept;
  if (sales) params.sales = sales;
  if (keyword) params.keyword = keyword;

  // 无数据提示
  if (!schoolsData || schoolsData.length === 0) {
    showToast('当前列表无数据可导出', 'error');
    return;
  }

  // 按钮加载态
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '导出中...';

  try {
    const { blob, filename } = await API.exportSchools(params);

    // 触发下载
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`已导出 ${schoolsData.length} 条`, 'success');
  } catch (e) {
    console.error('导出失败:', e);
    showToast(e.message || '导出失败', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = origText;
  }
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

  let allRecords = recordsData;
  let filtered = allRecords.filter(r =>
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

async function submitFollowUp() {
  const schoolName = document.getElementById('followUpSchoolValue').value || '';
  const textarea = document.querySelector('#followUpModal .form-textarea');
  const nextStepInput = document.getElementById('followUpNextStep');
  const statusAfterSel = document.getElementById('followUpStatusAfter');

  const nextStep = nextStepInput?.value || '';
  const content = textarea?.value || '';
  let statusAfter = statusAfterSel?.value || '';

  let schoolId = null;

  if (lockedSchoolId) {
    // 锁定模式（从学校列表行进入/编辑已有记录），直接使用 lockedSchoolId
    schoolId = lockedSchoolId;
  } else {
    // 可选模式，正常校验
    if (!schoolName || !content) {
      showToast('请填写学校和工作内容', 'warning');
      return;
    }
    const schoolObj = schoolsData.find(s => s.name === schoolName);
    schoolId = schoolObj ? schoolObj.id : null;
    if (!schoolId) {
      showToast('学校信息不存在，请重新选择', 'warning');
      return;
    }
  }

  if (!content) {
    showToast('请填写工作内容', 'warning');
    return;
  }

  // 智能关键词提示：用户没选状态时，扫描内容看是否有关键词
  if (!statusAfter) {
    const hint = scanStatusHint(content);
    if (hint) {
      const ok = confirm(`检测到"${content}"可能包含"${hint}"相关内容，是否同时将学校状态更新为【${hint}】？`);
      if (ok) {
        statusAfter = hint;
        // 同步更新下拉选中值（方便下次编辑看到）
        if (statusAfterSel) statusAfterSel.value = hint;
      }
    }
  }

  try {
    let res;
    if (editingRecordId) {
      // 编辑模式：更新记录
      const body = {
        school_id: schoolId,
        content,
        next_step: nextStep,
      };
      if (statusAfter) body.status_after = statusAfter;
      res = await API.updateWorkRecord(editingRecordId, body);
    } else {
      // 新建模式：创建记录
      const body = {
        school_id: schoolId,
        content,
        next_step: nextStep,
        user_id: currentUser.id,
      };
      if (statusAfter) body.status_after = statusAfter;
      res = await API.createWorkRecord(body);
    }

    const wasEditing = !!editingRecordId;
    closeModal('followUpModal');

    // 清空表单
    document.getElementById('followUpSchoolValue').value = '';
    const trigger = document.querySelector('#followUpSchoolContainer .school-search-trigger');
    if (trigger) trigger.value = '';
    if (nextStepInput) nextStepInput.value = '';
    textarea.value = '';
    // 重置状态下拉
    if (statusAfterSel) statusAfterSel.value = '';
    // 重置锁定状态
    lockedSchoolId = null;
    const schoolContainer = document.getElementById('followUpSchoolContainer');
    if (schoolContainer) schoolContainer.removeAttribute('data-locked');
    if (trigger) {
      trigger.readOnly = false;
      trigger.style.cursor = '';
      trigger.style.backgroundColor = '';
    }

    if (res && res.success === true) {
      let msg = wasEditing ? '工作记录已更新' : '工作记录已保存';
      if (statusAfter) msg += `，学校状态已同步为【${statusAfter}】`;
      showToast(msg, 'success');
      // 刷新数据不影响成功提示
      try {
        await loadData();
        renderRecordsTable();
        renderMobileRecordsCards();
        // 自动刷新学校详情页的工作记录时间线
        if (currentSchoolId && detailTabLoaded.workRecords) {
          await loadFollowRecords(currentSchoolId);
        }
      } catch (refreshErr) {
        console.error('submitFollowUp refresh error:', refreshErr);
      }
    } else {
      showToast(res.message || '保存失败，请重试', 'error');
    }
  } catch (err) {
    console.error('submitFollowUp error:', err);
    showToast('保存失败: ' + (err.message || err || '未知错误'), 'error');
  }
}

async function submitNewSchool() {
  const nameInput = document.getElementById('newSchoolName');
  const levelSelect = document.getElementById('newSchoolLevel');
  const typeSelect = document.getElementById('newSchoolType');

  const name = nameInput?.value?.trim() || '';
  const region = getNewSchoolRegion() || '-';
  const level = levelSelect?.value || '-';
  const type = typeSelect?.value || '-';

  if (!name) {
    showToast('请填写学校名称', 'warning');
    return;
  }

  if (region === '-' || level === '-' || type === '-') {
    showToast('请完善区域、学段和学校类型', 'warning');
    return;
  }

  // 创建新学校记录（后端自动填充 sales_id 和 dept，只需传必要字段）
  const schoolRes = await API.createSchool({
    name,
    region,
    grade: level,
    type,
    source_channel: '-',
    status: '初步接触',
  });

  if (schoolRes && schoolRes.success === true) {
    // 如果是手动输入的新学校，添加到字典库
    if (isManualMode || !matchedSchool) {
      const existing = schoolDictData.find(s => s.name === name);
      if (!existing) {
        await API.createSchoolDict({
          name,
          region,
          level,
          type,
          dept: currentUser.dept,
        });
      }
    }

    closeModal('newSchoolModal');

    // 清空表单
    clearSchoolSelection();
    levelSelect.value = '';
    typeSelect.value = '';

    await loadData();
    renderSchoolsTable();
    if (isManualMode || !matchedSchool) {
      showToast(`学校"${name}"已创建并加入字典库`, 'success');
    } else {
      showToast(`学校"${name}"已创建`, 'success');
    }
  } else {
    const errorMsg = (schoolRes && schoolRes.message) || '创建失败，请重试';
    showToast(errorMsg, 'error');
  }
}

async function submitContract() {
  const fileInput = document.getElementById('contractFileInput');
  const signDate = document.getElementById('contractSignDate').value;
  const remark = document.getElementById('contractRemark').value || '-';

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast('请上传合同文件', 'warning');
    return;
  }

  const fileName = fileInput.files[0].name;

  const res = await API.createContract({
    school_id: currentSchoolId,
    file_url: fileName,
    sign_date: signDate || '-',
    notes: remark,
  });

  closeModal('contractModal');

  // 清空表单
  fileInput.value = '';
  document.getElementById('contractSignDate').value = '';
  document.getElementById('contractRemark').value = '';

  if (res && res.success === true) {
    await loadSchoolDetail(currentSchoolId);
    showToast('合同已录入', 'success');
  } else {
    showToast('录入失败，请重试', 'error');
  }
}

/* ==================== 设备投放 ==================== */

async function saveDeviceDeployment() {
  const deployDate = document.getElementById('deployDate').value;
  const deployQuantity = document.getElementById('deployQuantity').value;

  if (!deployDate) {
    showToast('请选择投放日期', 'warning');
    return;
  }

  if (!deployQuantity || Number(deployQuantity) < 1) {
    showToast('请输入有效的投放数量', 'warning');
    return;
  }

  const quantity = Number(deployQuantity);

  const res = await API.createDevicePlacement({
    school_id: currentSchoolId,
    deploy_date: deployDate,
    quantity,
  });

  closeModal('deviceDeploymentModal');

  // 清空表单
  document.getElementById('deployDate').value = '';
  document.getElementById('deployQuantity').value = '';

  if (res && res.success === true) {
    if (detailTabLoaded.devices) {
      await loadSchoolDevices(currentSchoolId);
    } else {
      await loadSchoolDetail(currentSchoolId);
    }
    showToast('投放记录已保存', 'success');
  } else {
    showToast('保存失败，请重试', 'error');
  }
}

/* ==================== 学校状态变更 ==================== */

/* ==================== 状态流转条 ==================== */

/**
 * 渲染状态流转条
 */
function renderStatusFlow() {
  const bar = document.getElementById('statusFlowBar');
  if (!bar) return;

  const d = schoolDetail;
  if (!d) return;
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
}

/**
 * 更新两处状态 badge（头部 + 基础信息）
 */
function updateSchoolStatusBadge() {
  const d = schoolDetail;
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
 * 根据当前状态、用户角色控制按钮显示
 * 超级管理员/一级部门负责人：显示所有按钮
 * 员工：已签约 → 可推进；运营中 → 可推进
 */
function updateFlowButtonsVisibility() {
  const d = schoolDetail;
  const actions = document.getElementById('statusFlowActions');
  if (!actions || !d) return;

  const resumeBtn = actions.querySelector('.btn-resume');
  const advanceBtn = actions.querySelector('[onclick="advanceSchool()"]');
  const pauseBtn = actions.querySelector('[onclick="pauseSchool()"]');
  const terminateBtn = actions.querySelector('[onclick="terminateSchool()"]');

  const role = currentUser.role;
  const isEmployee = role === '员工';
  const isAdmin = role === '超级管理员' || role === '一级部门负责人';

  // 隐藏所有按钮作为默认
  if (advanceBtn) advanceBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'none';
  if (terminateBtn) terminateBtn.style.display = 'none';
  if (resumeBtn) resumeBtn.style.display = 'none';

  if (d.paused) {
    // 暂停状态：显示恢复按钮
    if (resumeBtn) resumeBtn.style.display = '';
    return;
  }

  if (d.status === '终止推进') {
    // 终止状态：隐藏所有按钮
    return;
  }

  // 超级管理员和一级部门负责人：始终显示推进+暂停+终止
  if (isAdmin) {
    if (d.status !== '已到期' && d.status !== '终止推进') {
      if (advanceBtn) advanceBtn.style.display = '';
    }
    if (pauseBtn) pauseBtn.style.display = '';
    if (terminateBtn) terminateBtn.style.display = '';
    return;
  }

  // 员工角色
  if (isEmployee) {
    if (d.status === '运营中') {
      // 运营中：显示推进到已到期
      if (advanceBtn) advanceBtn.style.display = '';
      if (pauseBtn) pauseBtn.style.display = '';
      if (terminateBtn) terminateBtn.style.display = '';
    } else if (d.status === '已到期') {
      // 已到期：不显示推进，只保留暂停/终止
      if (pauseBtn) pauseBtn.style.display = '';
      if (terminateBtn) terminateBtn.style.display = '';
    } else {
      // 初步接触/有意向/方案沟通/已签约：显示推进
      if (advanceBtn) advanceBtn.style.display = '';
      if (pauseBtn) pauseBtn.style.display = '';
      if (terminateBtn) terminateBtn.style.display = '';
    }
    return;
  }
}

/**
 * 渲染工作记录时间线（从 API 加载）
 */
async function renderTimeline(schoolId) {
  const timeline = document.getElementById('followUpTimeline');
  if (!timeline) return;

  try {
    const res = await API.getWorkRecords({ school_id: schoolId });
    const records = res && res.success ? res.data : [];

    // 清空现有静态内容
    timeline.innerHTML = '';

    if (records.length === 0) {
      timeline.classList.add('empty-state');
      timeline.classList.add('timeline-empty');
      timeline.innerHTML = '<div style="text-align:center;color:#999;padding:40px 0;">暂无工作记录</div>';
      return;
    }

    timeline.classList.remove('empty-state');
    timeline.classList.remove('timeline-empty');
    records.forEach(record => {
      const timeStr = record.created_at
        ? new Date(record.created_at).toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          }).replace(/\//g, '-')
        : '';

      const badgeHtml = '';

      const item = document.createElement('div');
      item.className = 'timeline-item';
      const recordStatus = record.school_status || record.status || '';
      const statusBadgeHtml = recordStatus
        ? `<span class="timeline-status-badge badge ${getStatusBadge(recordStatus)}">${recordStatus}</span>`
        : '';
      item.innerHTML = `
        <div class="timeline-header">
          <div class="timeline-left"><span class="timeline-operator">${record.user_name || '系统'}</span>${statusBadgeHtml}</div>
          <span class="timeline-time">${timeStr}</span>
        </div>
        <div class="timeline-body">
          <div>${record.content || ''}</div>
          ${record.next_step ? `<div class="timeline-next-step">下一步：${record.next_step}</div>` : ''}
        </div>
      `;
      timeline.appendChild(item);
    });
  } catch (e) {
    console.error('加载工作时间线失败:', e);
    timeline.classList.add('timeline-empty');
    timeline.innerHTML = '<div style="text-align:center;color:#999;padding:40px 0;">加载失败，请刷新重试</div>';
  }
}

/**
 * 渲染合同信息表格（从 API 加载）
 */
async function renderContractsTable(schoolId) {
  const tbody = document.getElementById('contractTableBody');
  if (!tbody) return;

  try {
    const res = await API.getContracts({ school_id: schoolId });
    const contracts = res && res.success ? res.data : [];

    tbody.innerHTML = '';

    if (contracts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:40px 0;">暂无合同信息</td></tr>';
      return;
    }

    contracts.forEach(contract => {
      const signDate = contract.sign_date
        ? new Date(contract.sign_date).toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g, '-')
        : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${contract.contract_no || '-'}</td>
        <td>${signDate}</td>
        <td>${contract.file_url ? `<span class="text-link" onclick="window.open('${contract.file_url}')">${contract.file_name || '查看文件'}</span>` : '-'}</td>
        <td>${contract.remark || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('加载合同信息失败:', e);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:40px 0;">加载失败，请刷新重试</td></tr>';
  }
}

/**
 * 渲染设备投放表格（从 API 加载）
 */
async function renderDeviceDeploymentTable(schoolId) {
  const tbody = document.getElementById('deviceDeploymentTableBody');
  if (!tbody) return;

  try {
    const res = await API.getDevicePlacements({ school_id: schoolId });
    const placements = res && res.success ? res.data : [];

    tbody.innerHTML = '';

    if (placements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px 0;">暂无设备投放记录</td></tr>';
      return;
    }

    // 状态badge颜色映射
    const statusColors = {
      '已投放': 'badge-green',
      '待投放': 'badge-yellow',
      '部分投放': 'badge-blue',
    };

    placements.forEach(p => {
      const placeDate = p.place_date
        ? new Date(p.place_date).toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g, '-')
        : '-';

      const statusClass = statusColors[p.status] || 'badge-green';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${placeDate}</td>
        <td>${p.device_type || '-'}</td>
        <td>${p.quantity || 0}台</td>
        <td><span class="badge ${statusClass}">${p.status || '已投放'}</span></td>
        <td>${p.user_name || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('加载设备投放记录失败:', e);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px 0;">加载失败，请刷新重试</td></tr>';
  }
}


/**
 * 在工作记录时间线顶部添加一条记录
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
 * 在操作日志表格顶部添加一行记录
 */
function prependDetailLogItem(operator, action, detail) {
  const tbody = document.getElementById('schoolDetailLogsBody');
  if (!tbody) return;

  const now = new Date();
  const time = now.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${time}</td>
    <td>${operator}</td>
    <td>${action}</td>
    <td>${detail}</td>
  `;

  if (tbody.firstChild) {
    tbody.insertBefore(row, tbody.firstChild);
  } else {
    tbody.appendChild(row);
  }
}

/**
 * 推进到下一阶段
 */
async function advanceSchool() {
  const d = schoolDetail;
  if (d.paused) {
    showToast('该校处于暂停状态，请先恢复推进', 'warning');
    return;
  }
  if (d.status === '终止推进') {
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

  openConfirmModal(`确定要将「${d.name}」从「${prevStatus}」推进到「${nextStatus}」吗？`, async (confirmed) => {
    if (confirmed) {
      const res = await API.advanceSchool(currentSchoolId);
      if (res && res.success === true) {
        d.status = res.data.status;
        d.statusIndex = d.statusFlow.indexOf(d.status);

        renderStatusFlow();
        updateSchoolStatusBadge();
        updateFlowButtonsVisibility();
        prependDetailLogItem(getCurrentUserName(), '状态变更', `${prevStatus} → ${d.status}`);
        showToast(`已推进至「${d.status}」`, 'success');
      } else {
        showToast('操作失败，请重试', 'error');
      }
    }
  }, 'info');
}

/**
 * 暂停推进 - 打开原因弹窗
 */
function pauseSchool() {
  const d = schoolDetail;
  if (d.paused) {
    showToast('该校已处于暂停状态', 'warning');
    return;
  }
  if (d.status === '终止推进') {
    showToast('该校已终止，无法暂停', 'error');
    return;
  }

  // 清空输入框并打开弹窗
  document.getElementById('pauseReasonInput').value = '';
  openModal('pauseReasonModal');
}

/**
 * 提交暂停原因并执行暂停
 */
async function submitPauseReason() {
  const reason = document.getElementById('pauseReasonInput').value.trim();
  if (!reason) {
    showToast('请填写暂停原因', 'warning');
    return;
  }

  try {
    const d = schoolDetail;
    const res = await API.pauseSchool(currentSchoolId);
    console.log('[DEBUG] 暂停推进响应:', JSON.stringify(res));
    console.log('[DEBUG] res.success type:', typeof res?.success, 'value:', res?.success);
    if (res && res.success === true) {
      const prevStatus = d.status;
      const prevIndex = d.statusIndex;
      d.pausedFrom = prevStatus;
      d.pausedIndex = prevIndex;
      d.paused = true;
      d.status = res.data.status;
      d.statusIndex = d.statusFlow.indexOf(d.status);

      renderStatusFlow();
      updateSchoolStatusBadge();
      updateFlowButtonsVisibility();
      prependDetailLogItem(getCurrentUserName(), '暂停推进', `原阶段：${prevStatus}，原因：${reason}`);
      showToast('已暂停推进该校', 'success');
    } else {
      showToast('操作失败，请重试', 'error');
    }
  } catch (e) {
    console.error('暂停推进失败:', e);
    showToast('操作失败，请重试', 'error');
  } finally {
    document.getElementById('pauseReasonInput').value = '';
    closeModal('pauseReasonModal');
  }
}

/**
 * 恢复推进
 */
async function resumeSchool() {
  const d = schoolDetail;
  if (!d.paused) {
    showToast('该校未处于暂停状态', 'warning');
    return;
  }

  openConfirmModal(`确定要恢复推进「${d.name}」吗？`, async (confirmed) => {
    if (confirmed) {
      const res = await API.resumeSchool(currentSchoolId);
      if (res && res.success === true) {
        const prevPausedStatus = d.pausedFrom;
        d.status = res.data.status;
        d.statusIndex = d.statusFlow.indexOf(d.status);
        d.paused = false;
        d.pausedFrom = null;
        d.pausedIndex = null;

        renderStatusFlow();
        updateSchoolStatusBadge();
        updateFlowButtonsVisibility();
        prependDetailLogItem(getCurrentUserName(), '恢复推进', `暂停前阶段：${prevPausedStatus}，当前状态：${d.status}`);
        showToast(`已恢复推进，当前状态：「${d.status}」`, 'success');
      } else {
        showToast('操作失败，请重试', 'error');
      }
    }
  }, 'info');
}

/**
 * 终止推进 - 打开原因弹窗
 */
function terminateSchool() {
  const d = schoolDetail;
  if (d.paused) {
    showToast('该校处于暂停状态，请先恢复推进', 'warning');
    return;
  }
  if (d.status === '终止推进') {
    showToast('该校已终止', 'error');
    return;
  }

  // 清空输入框并打开弹窗
  document.getElementById('terminateReasonInput').value = '';
  openModal('terminateReasonModal');
}

/**
 * 提交终止原因并执行终止
 */
async function submitTerminateReason() {
  const reason = document.getElementById('terminateReasonInput').value.trim();
  if (!reason) {
    showToast('请填写终止原因', 'warning');
    return;
  }

  try {
    const d = schoolDetail;
    const res = await API.terminateSchool(currentSchoolId);
    console.log('[DEBUG] 终止推进响应:', JSON.stringify(res));
    console.log('[DEBUG] res.success type:', typeof res?.success, 'value:', res?.success);
    if (res && res.success === true) {
      const prevStatus = d.status;
      d.status = res.data.status;
      d.statusIndex = d.statusFlow.indexOf(d.status);

      renderStatusFlow();
      updateSchoolStatusBadge();
      updateFlowButtonsVisibility();
      prependDetailLogItem(getCurrentUserName(), '终止推进', `原阶段：${prevStatus}，原因：${reason}`);
      showToast('已终止推进该校', 'success');
    } else {
      showToast('操作失败，请重试', 'error');
    }
  } catch (e) {
    console.error('终止推进失败:', e);
    showToast('操作失败，请重试', 'error');
  } finally {
    document.getElementById('terminateReasonInput').value = '';
    closeModal('terminateReasonModal');
  }
}

/* ==================== 联系人管理 ==================== */

const roleBadgeClass = {
  '决策人': 'badge-red',
  '对接人': 'badge-blue',
  '技术负责人': 'badge-purple',
  '使用者': 'badge-green',
};

const avatarColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

let editingContactId = null;

function renderContacts() {
  const container = document.getElementById('contactsContainer');
  if (!container) return;

  if (schoolContacts.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px 0;">暂无学校联系人</div>';
    return;
  }

  container.innerHTML = schoolContacts.map((c, i) => {
    const badgeClass = roleBadgeClass[c.relation] || 'badge-blue';
    const color = avatarColors[i % avatarColors.length];
    const phone = c.phone || '-';
    return `
      <div class="contact-card">
        <div class="contact-avatar" style="background:${color};">${c.name.charAt(0)}</div>
        <div class="contact-info">
          <div class="contact-name">${c.name} <span class="badge ${badgeClass}">${c.relation}</span></div>
          <div class="contact-meta">${c.role} · ${phone}</div>
        </div>
        <div class="contact-actions">
          <span class="text-link" onclick="openEditContactModal(${c.id})">编辑</span>
          <span class="text-link" style="color:#ef4444" onclick="deleteContact(${c.id})">删除</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectPosition(pos) {
  const input = document.getElementById('contactPosition');
  if (input) input.value = pos;
}

function sanitizePhone(input) {
  input.value = input.value.replace(/[^0-9\-\+]/g, '');
  validatePhone(input.value, false);
}

function validatePhone(phone, showError) {
  const errorEl = document.getElementById('phoneError');
  if (!phone) {
    if (errorEl) errorEl.style.display = 'none';
    return true;
  }
  // 手机号：11位数字，以1开头
  const mobileRe = /^1[3-9]\d{9}$/;
  // 座机：区号-号码，区号2-4位，号码7-8位
  const landlineRe = /^\d{2,4}-\d{7,8}$/;
  if (mobileRe.test(phone) || landlineRe.test(phone)) {
    if (errorEl) errorEl.style.display = 'none';
    return true;
  }
  if (showError && errorEl) errorEl.style.display = 'block';
  return false;
}

function openAddContactModal() {
  editingContactId = null;
  document.querySelector('#addContactModal .modal-title').textContent = '添加学校联系人';
  document.querySelector('#addContactModal .modal-footer .btn-primary').textContent = '添加';
  // 清空表单
  const inputs = document.querySelectorAll('#addContactModal .form-input');
  inputs.forEach(input => input.value = '');
  const roleSelect = document.getElementById('contactRoleSelect');
  if (roleSelect) roleSelect.value = '';
  const phoneError = document.getElementById('phoneError');
  if (phoneError) phoneError.style.display = 'none';
  openModal('addContactModal');
}

function openEditContactModal(contactId) {
  const contact = schoolContacts.find(c => c.id === contactId);
  if (!contact) return;

  editingContactId = contactId;
  document.querySelector('#addContactModal .modal-title').textContent = '编辑学校联系人';
  document.querySelector('#addContactModal .modal-footer .btn-primary').textContent = '保存';

  const inputs = document.querySelectorAll('#addContactModal .form-input');
  inputs[0].value = contact.name || '';
  inputs[1].value = contact.role || '';
  inputs[2].value = contact.phone || '';
  const roleSelect = document.getElementById('contactRoleSelect');
  if (roleSelect) roleSelect.value = contact.relation || '';
  const phoneError = document.getElementById('phoneError');
  if (phoneError) phoneError.style.display = 'none';

  openModal('addContactModal');
}

function submitContact() {
  if (editingContactId !== null) {
    submitEditContact();
  } else {
    submitAddContact();
  }
}

async function submitAddContact() {
  const name = document.getElementById('contactName')?.value || document.querySelectorAll('#addContactModal .form-input')[0]?.value || '';
  const role = document.getElementById('contactPosition')?.value || document.querySelectorAll('#addContactModal .form-input')[1]?.value || '';
  const phone = document.getElementById('contactPhone')?.value || document.querySelectorAll('#addContactModal .form-input')[2]?.value || '';
  const roleSelect = document.getElementById('contactRoleSelect');
  const relation = roleSelect?.value || '';

  if (!name || !role || !relation) {
    showToast('请填写联系人姓名、职务和角色', 'warning');
    return;
  }

  if (phone && !validatePhone(phone, true)) {
    showToast('请输入正确的电话号码', 'warning');
    return;
  }

  try {
    const res = await API.createContact(schoolDetail.id, { name, role, phone, relation });
    if (res.success) {
      closeModal('addContactModal');
      const inputs = document.querySelectorAll('#addContactModal .form-input');
      inputs.forEach(input => input.value = '');
      roleSelect.value = '';
      showToast(`学校联系人"${name}"已添加`, 'success');

      // 重新加载联系人列表
      const contactsRes = await API.getContacts(schoolDetail.id);
      schoolContacts = contactsRes.data || [];
      renderContacts();
    } else {
      showToast('添加失败，请重试', 'error');
    }
  } catch (e) {
    console.error('添加联系人失败:', e);
    showToast('添加失败，请重试', 'error');
  }
}

async function submitEditContact() {
  const name = document.getElementById('contactName')?.value || document.querySelectorAll('#addContactModal .form-input')[0]?.value || '';
  const role = document.getElementById('contactPosition')?.value || document.querySelectorAll('#addContactModal .form-input')[1]?.value || '';
  const phone = document.getElementById('contactPhone')?.value || document.querySelectorAll('#addContactModal .form-input')[2]?.value || '';
  const roleSelect = document.getElementById('contactRoleSelect');
  const relation = roleSelect?.value || '';

  if (!name || !role || !relation) {
    showToast('请填写联系人姓名、职务和角色', 'warning');
    return;
  }

  if (phone && !validatePhone(phone, true)) {
    showToast('请输入正确的电话号码', 'warning');
    return;
  }

  try {
    const res = await API.updateContact(schoolDetail.id, editingContactId, { name, role, phone, relation });
    if (res.success) {
      closeModal('addContactModal');
      editingContactId = null;
      showToast(`学校联系人"${name}"已更新`, 'success');

      // 重新加载联系人列表
      const contactsRes = await API.getContacts(schoolDetail.id);
      schoolContacts = contactsRes.data || [];
      renderContacts();
    } else {
      showToast('修改失败，请重试', 'error');
    }
  } catch (e) {
    console.error('修改联系人失败:', e);
    showToast('修改失败，请重试', 'error');
  }
}

async function deleteContact(contactId) {
  const contact = schoolContacts.find(c => c.id === contactId);
  if (!contact) return;

  if (!confirm(`确定要删除学校联系人"${contact.name}"吗？`)) {
    return;
  }

  try {
    const res = await API.deleteContact(schoolDetail.id, contactId);
    if (res.success) {
      showToast(`学校联系人"${contact.name}"已删除`, 'success');

      // 重新加载联系人列表
      const contactsRes = await API.getContacts(schoolDetail.id);
      schoolContacts = contactsRes.data || [];
      renderContacts();
    } else {
      showToast('删除失败，请重试', 'error');
    }
  } catch (e) {
    console.error('删除联系人失败:', e);
    showToast('删除失败，请重试', 'error');
  }
}

/* ==================== 用户管理 ==================== */

let editingUserId = null;

// 密码登录开关滑块状态更新
function updateAllowPwdSlider(prefix, checked) {
  const slider = document.getElementById(prefix + 'AllowPwdSlider');
  if (slider) {
    slider.style.background = checked ? '#3b82f6' : '#d1d5db';
  }
}

// 初始化密码登录开关事件
function initAllowPwdToggles() {
  ['addUser', 'editUser'].forEach(prefix => {
    const cb = document.getElementById(prefix + 'AllowPwd');
    if (cb) {
      cb.addEventListener('change', () => updateAllowPwdSlider(prefix, cb.checked));
      updateAllowPwdSlider(prefix, cb.checked);
    }
  });
}

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
  // 重置密码登录开关（默认关闭）
  const cb = document.getElementById('addUserAllowPwd');
  if (cb) { cb.checked = false; updateAllowPwdSlider('addUser', false); }
  openModal('addUserModal');
}

async function syncFeishuContacts() {
  // 打开部门选择弹窗
  openModal('feishuDeptModal');
  await loadFeishuDepartments();
}

async function loadFeishuDepartments() {
  const listEl = document.getElementById('feishuDeptList');
  if (!listEl) return;

  listEl.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const res = await API.getFeishuDepartments();

    if (res && res.success && res.data) {
      const departments = res.data;
      if (departments.length === 0) {
        listEl.innerHTML = '<div class="text-muted" style="padding:12px;">飞书租户未配置部门，将同步所有人员</div>';
        window._feishuNoDepartments = true;
      } else {
        // 平铺列表渲染一级部门
        listEl.innerHTML = departments.map(dept => `
          <label class="dept-list-item" onmouseenter="this.classList.add('dept-list-hover')" onmouseleave="this.classList.remove('dept-list-hover')">
            <input type="checkbox" class="feishu-dept-checkbox" value="${dept.id}">
            <span class="dept-list-name">${dept.name}</span>
            <span class="dept-list-count">${dept.member_count}人</span>
          </label>
        `).join('');
        window._feishuNoDepartments = false;
      }
    } else {
      listEl.innerHTML = `<div class="text-muted">获取部门列表失败：${res?.message || '未知错误'}</div>`;
      window._feishuNoDepartments = false;
    }
  } catch (e) {
    listEl.innerHTML = '<div class="text-muted">获取部门列表失败，请检查飞书配置</div>';
    window._feishuNoDepartments = false;
  }
}

function toggleAllDepts() {
  const checkboxes = document.querySelectorAll('.feishu-dept-checkbox');
  if (checkboxes.length === 0) return;

  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  const newChecked = !allChecked;

  checkboxes.forEach(cb => {
    cb.checked = newChecked;
  });
}

async function confirmFeishuSync() {
  const checkboxes = document.querySelectorAll('.feishu-dept-checkbox:checked');
  const departmentIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (departmentIds.length === 0 && !window._feishuNoDepartments) {
    showToast('请至少选择一个部门', 'warning');
    return;
  }

  closeModal('feishuDeptModal');

  try {
    showToast('正在同步飞书通讯录...', 'info');
    const res = await API.syncFeishuContacts(departmentIds);

    if (res && res.success === true) {
      await loadData();
      renderUsersTable();
      const d = res.data || {};
      let msg = `同步完成！新增: ${d.added || 0}, 更新: ${d.updated || 0}, 停用: ${d.disabled || 0}`;
      if (d.errors && d.errors.length > 0) {
        msg += '\n\n错误详情:\n' + d.errors.join('\n');
        showToast(msg, 'warning');
      } else {
        showToast(msg, 'success');
      }
    } else {
      showToast(res?.message || '同步失败，请重试', 'error');
    }
  } catch (e) {
    showToast('同步失败: ' + (e.message || '网络错误'), 'error');
  }
}

// ==================== 账号管理 ====================
function normalizeUserStatus(raw) {
  if (raw === 1 || raw === '1' || raw === '启用' || raw === 'active') return '启用';
  return '停用';
}
function normalizeAllowPwdLogin(raw) {
  return raw === 1 || raw === '1' || raw === true || raw === 'true';
}

function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  const sourceMap = { manual: '手动新增', import: '批量导入', feishu: '飞书同步' };
  tbody.innerHTML = usersData.map(u => {
    const roleBadge = u.role === '员工' ? 'badge-blue'
      : u.role === '超级管理员' ? 'badge-red'
      : u.role === '一级部门负责人' ? 'badge-purple'
      : 'badge-blue';
    const statusText = normalizeUserStatus(u.status);
    const statusBadge = statusText === '启用' ? 'badge-green' : 'badge-gray';
    const statusOn = statusText === '启用';
    const pwdOn = normalizeAllowPwdLogin(u.allow_password_login);
    const feishuId = u.feishu_open_id ? `<span class="text-muted">${u.feishu_open_id.substring(0, 8)}...</span>` : '<span class="text-muted">--</span>';
    const sourceLabel = sourceMap[u.source] || '<span class="text-muted">未知</span>';
    const createdAt = u.created_at ? String(u.created_at).replace('T', ' ').slice(0, 16) : '<span class="text-muted">--</span>';

    // 超管自己的 allow_password_login 不允许关闭
    const isSelfSuperAdmin = u.id === currentUser.id && u.role === '超级管理员';
    const pwdSwitchHtml = isSelfSuperAdmin
      ? renderUserSwitch(pwdOn, 'pwd', u.id, false, true)
      : renderUserSwitch(pwdOn, 'pwd', u.id, true, false);
    const statusSwitchHtml = renderUserSwitch(statusOn, 'status', u.id, true, false);

    return `<tr data-user-id="${u.id}">
      <td>${u.name}</td>
      <td><span class="badge ${roleBadge}">${u.role}</span></td>
      <td>${u.dept}</td>
      <td>${u.phone || ''}</td>
      <td>${feishuId}</td>
      <td>${sourceLabel}</td>
      <td>${createdAt}</td>
      <td>${pwdSwitchHtml}</td>
      <td>${statusSwitchHtml}</td>
      <td>
        <span class="text-link" onclick="openEditUserModal(${u.id})">编辑</span>
        <span class="text-link text-danger" style="margin-left:12px;cursor:inherit" onclick="confirmDeleteUser(${u.id})">删除</span>
      </td>
    </tr>`;
  }).join('');
}

function renderUserSwitch(isOn, type, userId, clickable, isSelfProtected) {
  const bg = isOn ? '#22c55e' : '#d1d5db';
  const label = type === 'pwd' ? (isOn ? '已开启' : '未开启') : (isOn ? '启用' : '停用');
  const cursor = (!clickable) ? 'not-allowed' : 'pointer';
  const opacity = (!clickable && !isOn) ? '0.5' : '1';
  const title = isSelfProtected ? '超管不允许关闭自己的密码登录' : '';
  return `<span class="user-switch-wrapper" style="display:inline-flex;align-items:center;gap:6px;cursor:${cursor};opacity:${opacity};${title ? 'cursor:not-allowed;' : ''}" ${clickable ? `onclick="handleUserToggle(${userId}, '${type}', ${isOn})"` : ''} ${title ? `title="${title}"` : ''}>
    <span style="width:36px;height:20px;border-radius:10px;background:${bg};position:relative;display:inline-block;flex-shrink:0;transition:background 0.2s;">
      <span style="position:absolute;top:2px;left:${isOn ? '20' : '2'}px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
    </span>
    <span style="font-size:12px;color:${isOn ? '#16a34a' : '#6b7280'};">${label}</span>
  </span>`;
}

async function handleUserToggle(userId, type, currentOn) {
  const newOn = !currentOn;
  const tr = document.querySelector(`tr[data-user-id="${userId}"]`);

  // 禁用操作二次确认
  if (type === 'status' && !newOn) {
    const user = usersData.find(u => u.id === userId);
    if (!confirm(`确定要停用账号 "${user?.name || ''}" 吗？`)) return;
  }
  if (type === 'pwd' && !newOn) {
    if (!confirm(`确定要关闭该账号的密码登录功能吗？`)) return;
  }

  // 乐观更新 UI
  const user = usersData.find(u => u.id === userId);
  if (type === 'status') {
    user.status = newOn ? '启用' : '停用';
  } else {
    user.allow_password_login = newOn ? 1 : 0;
  }
  renderUsersTable();

  try {
    const payload = type === 'status'
      ? { status: newOn ? '启用' : '停用' }
      : { allow_password_login: newOn ? 1 : 0 };
    const res = await API.updateUser(userId, payload);
    if (!res || !res.success) {
      throw new Error(res?.message || '更新失败');
    }
    showToast('更新成功');
  } catch (err) {
    // 失败回滚
    if (type === 'status') {
      user.status = currentOn ? '启用' : '停用';
    } else {
      user.allow_password_login = currentOn ? 1 : 0;
    }
    renderUsersTable();
    showToast('更新失败: ' + (err.message || '网络错误'), 'error');
  }
}

function confirmDeleteUser(userId) {
  const user = usersData.find(u => u.id === userId);
  if (!user) return;
  if (!confirm(`确定要删除用户 "${user.name}" 吗？此操作不可恢复。`)) return;
  deleteUser(userId);
}

async function deleteUser(userId) {
  try {
    const res = await API.deleteUser(userId);
    if (res && res.success) {
      showToast('删除成功');
      usersData = usersData.filter(u => u.id !== userId);
      renderUsersTable();
      populateFilterOptions();
    } else {
      showToast(res?.message || '删除失败', 'error');
    }
  } catch (e) {
    showToast('删除失败: ' + (e.message || '网络错误'), 'error');
  }
}

function populateFilterOptions() {
  const deptSelect = document.getElementById('filter-dept');
  if (!deptSelect) return;
  const depts = [...new Set(usersData.map(u => u.dept).filter(d => d))];
  const currentValue = deptSelect.value;
  deptSelect.innerHTML = '<option value="">全部部门</option>' + depts.map(d => `<option value="${d}">${d}</option>`).join('');
  deptSelect.value = currentValue;
}

async function applyUserFilters() {
  const dept = document.getElementById('filter-dept').value;
  const role = document.getElementById('filter-role').value;
  const status = document.getElementById('filter-status').value;

  try {
    const params = new URLSearchParams();
    if (dept) params.set('dept', dept);
    if (role) params.set('role', role);
    if (status) params.set('status', status);

    const res = await API.get('/api/users?' + params.toString());
    if (res && res.success) {
      usersData = res.data || [];
      renderUsersTable();
      populateFilterOptions();
    }
  } catch (e) {
    showToast('筛选失败: ' + (e.message || '网络错误'), 'error');
  }
}

function openEditUserModal(userId) {
  const user = usersData.find(u => u.id === userId);
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
  if (inputs[5]) inputs[5].selectedIndex = normalizeUserStatus(user.status) === '启用' ? 0 : 1;

  // 设置密码登录开关
  const cb = document.getElementById('editUserAllowPwd');
  const allowPwd = normalizeAllowPwdLogin(user.allow_password_login);
  if (cb) { cb.checked = allowPwd; updateAllowPwdSlider('editUser', allowPwd); }

  openModal('editUserModal');
}

async function submitEditUser() {
  const inputs = document.querySelectorAll('#editUserModal .form-input, #editUserModal .form-select');

  const name = inputs[0]?.value || '';
  const phone = inputs[1]?.value || '';
  const email = inputs[2]?.value || '';
  const role = inputs[3]?.value || '';
  const dept = inputs[4]?.value || '';
  const status = inputs[5]?.value || '启用';
  const allowPwd = document.getElementById('editUserAllowPwd')?.checked ? true : false;

  if (!name) {
    showToast('请填写用户姓名', 'warning');
    return;
  }

  const res = await API.updateUser(editingUserId, {
    name,
    phone,
    email,
    role,
    dept,
    status,
    allow_password_login: allowPwd,
  });

  closeModal('editUserModal');

  if (res && res.success === true) {
    await loadData();
    renderUsersTable();
    showToast(`用户"${name}"已更新`, 'success');
  } else {
    showToast('更新失败，请重试', 'error');
  }
}

async function submitAddUser() {
  const inputs = document.querySelectorAll('#addUserModal .form-input, #addUserModal .form-select');

  const name = inputs[0]?.value || '';
  const phone = inputs[1]?.value || '';
  const email = inputs[2]?.value || '';
  const role = inputs[3]?.value || '员工';
  const dept = inputs[4]?.value || '销售一部';
  const status = inputs[5]?.value || '启用';
  const allowPwd = document.getElementById('addUserAllowPwd')?.checked ? true : false;

  if (!name) {
    showToast('请填写用户姓名', 'warning');
    return;
  }

  const res = await API.createUser({
    name,
    phone,
    email,
    role,
    dept,
    status,
    allow_password_login: allowPwd,
  });

  closeModal('addUserModal');

  if (res && res.success === true) {
    await loadData();
    renderUsersTable();
    showToast(`用户"${name}"已创建`, 'success');
  } else {
    showToast('创建失败，请重试', 'error');
  }
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

const importTypeMap = {
  school: {
    title: '导入学校数据',
    hint: '请上传包含学校信息的 Excel 文件，表头应包含：学校名称、所属部门、区域、学段、类型、当前状态、归属员工、创建时间。学校名称匹配已有学校则更新，否则自动新建。',
    templateType: 'school',
    templateName: '学校数据导入模板.xlsx',
    endpoint: '/api/data-management/import/school',
    successName: '学校数据',
  },
  record: {
    title: '导入工作记录',
    hint: '请上传包含工作记录的 Excel 文件，表头应包含：学校名称、跟进方式、跟进内容、下一步计划、操作人、跟进时间。学校名称匹配不到的将自动新建。',
    templateType: 'follow-record',
    templateName: '工作记录导入模板.xlsx',
    endpoint: '/api/data-management/import/follow-record',
    successName: '工作记录',
  },
  account: {
    title: '批量导入账号',
    hint: '请上传包含账号信息的 Excel 文件，表头应包含：姓名、手机号、邮箱、部门、角色。默认密码为 123456，重复的手机号或邮箱将自动跳过。',
    templateType: 'account',
    templateName: '账号导入模板.xlsx',
    endpoint: '/api/users/import',
    successName: '账号',
  },
};

function openImportModal(type) {
  currentImportType = type;
  currentImportFile = null;

  const config = importTypeMap[type] || importTypeMap.school;
  const title = document.getElementById('importModalTitle');
  const hint = document.getElementById('importModalHint');
  const fileInfo = document.getElementById('importFileInfo');
  const confirmBtn = document.getElementById('importConfirmBtn');
  const downloadBtn = document.getElementById('downloadTemplateBtn');

  title.textContent = config.title;
  hint.textContent = config.hint;
  fileInfo.style.display = 'none';
  confirmBtn.disabled = true;
  document.getElementById('importFileInput').value = '';

  // 设置模板下载按钮
  if (downloadBtn) {
    downloadBtn.onclick = async function() {
      try {
        await API.downloadImportTemplate(config.templateType, config.templateName);
      } catch (e) {
        showToast('模板下载失败，请重试', 'error');
      }
    };
    downloadBtn.style.display = 'inline-flex';
  }

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

async function confirmImport() {
  if (!currentImportFile) {
    showToast('请先选择文件', 'warning');
    return;
  }

  const config = importTypeMap[currentImportType] || importTypeMap.school;
  const confirmBtn = document.getElementById('importConfirmBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '导入中...';

  try {
    const res = await API.uploadImport(config.endpoint, currentImportFile);

    if (res && res.success) {
      const data = res.data || {};
      const successCount = data.success_count || 0;
      const skipCount = data.skip_count || 0;
      const newSchoolCount = data.new_school_count || 0;
      const insertCount = data.insert_count || 0;
      const updateCount = data.update_count || 0;
      const errors = data.errors || [];

      // 构建详细结果消息
      let msg = `成功导入 ${config.successName} ${successCount} 条`;
      if (skipCount > 0) msg += `，跳过 ${skipCount} 条`;
      if (newSchoolCount > 0) msg += `，自动新建 ${newSchoolCount} 所学校`;
      if (insertCount > 0 && newSchoolCount === 0) msg += `，新增 ${insertCount} 条`;
      if (updateCount > 0) msg += `，更新 ${updateCount} 条`;

      showToast(msg, 'success');

      // 如果有错误，弹出详情
      if (errors.length > 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'import-error-details';
        errorDiv.style.cssText = 'margin-top: 12px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; max-height: 300px; overflow-y: auto;';
        errorDiv.innerHTML = `
          <div style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">导入结果详情</div>
          <div style="color: #991b1b; font-size: 13px;">成功 ${successCount} 条 | 失败 ${errors.length} 条 | 跳过 ${skipCount} 条</div>
          <div style="margin-top: 8px; border-top: 1px solid #fecaca; padding-top: 8px;">
            ${errors.map(e => `<div style="padding: 4px 0; color: #b91c1c; font-size: 12px;">• ${e}</div>`).join('')}
          </div>
        `;

        const modal = document.getElementById('dataImportModal');
        const existingError = modal.querySelector('.import-error-details');
        if (existingError) existingError.remove();
        modal.querySelector('.modal-body').appendChild(errorDiv);

        // 暂停 10 秒让用户查看，然后自动关闭
        setTimeout(() => {
          const el = modal.querySelector('.import-error-details');
          if (el) el.remove();
        }, 30000);
      }

      // 关闭弹窗并刷新
      setTimeout(() => {
        closeModal('dataImportModal');
        renderDataManagement();
      }, errors.length > 0 ? 5000 : 1500);
    } else {
      showToast(res?.message || '导入失败，请重试', 'error');
    }
  } catch (e) {
    console.error('导入失败:', e);
    showToast('导入失败，请重试', 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '开始导入';
  }
}

/* ==================== 操作日志搜索 ==================== */

function searchLogs() {
  const keyword = (document.querySelector('#logsTableInput')?.value || '').trim().toLowerCase();
  const typeFilter = document.querySelector('#logsTypeFilter')?.value || '';
  const dateFrom = document.querySelector('#logsDateFrom')?.value || '';
  const dateTo = document.querySelector('#logsDateTo')?.value || '';
  const rows = document.querySelectorAll('#operationLogs-tbody tr');
  let count = 0;

  rows.forEach(row => {
    const dateCell = row.children[0]?.textContent || '';
    const user = row.children[1]?.textContent || '';
    const action = row.children[2]?.textContent || '';
    const matchUser = !keyword || user.toLowerCase().includes(keyword);
    const matchType = !typeFilter || action.includes(typeFilter);
    // 日期筛选：比较 created_at 的前10位（YYYY-MM-DD）
    const logDate = dateCell.substring(0, 10);
    const matchDateFrom = !dateFrom || logDate >= dateFrom;
    const matchDateTo = !dateTo || logDate <= dateTo;
    if (matchUser && matchType && matchDateFrom && matchDateTo) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });
}

function resetLogsFilter() {
  const input = document.querySelector('#logsTableInput');
  const select = document.querySelector('#logsTypeFilter');
  const dateFrom = document.querySelector('#logsDateFrom');
  const dateTo = document.querySelector('#logsDateTo');
  if (input) input.value = '';
  if (select) select.value = '';
  if (dateFrom) dateFrom.value = '';
  if (dateTo) dateTo.value = '';
  searchLogs();
}

/* ==================== 操作日志渲染 ==================== */

// logType 映射为前端显示名称
const logTypeMap = {
  'follow_up': '写工作记录',
  'operation': '工作记录',
  'contract': '录合同',
  'contact': '联系人变更',
  'device': '设备投放',
  'create': '学校创建',
  'status_flow': '状态变更',
};

// logType 对应的 badge 样式
const logTypeBadgeMap = {
  'follow_up': 'badge-blue',
  'operation': 'badge-purple',
  'contract': 'badge-green',
  'contact': 'badge-cyan',
  'device': 'badge-orange',
  'create': 'badge-green',
  'status_flow': 'badge-orange',
  '状态变更': 'badge-orange',
  '设备投放': 'badge-orange',
  '联系人变更': 'badge-cyan',
  '运营人员变更': 'badge-purple',
  '暂停推进': 'badge-yellow',
  '恢复推进': 'badge-green',
  '终止推进': 'badge-red',
};

// 将 logType 映射为前端显示名称（支持中文类型和历史数据兼容）
function mapLogType(log) {
  // 支持传整个 log 对象或仅 logType 字符串
  const logType = typeof log === 'string' ? log : log?.logType;
  const detail = typeof log !== 'string' ? log?.detail : '';

  // 先尝试直接映射
  const mapped = logTypeMap[logType];
  if (mapped) return mapped;

  // 中文类型直接返回（如 "状态变更"、"设备投放" 等）
  if (logType && typeof logType === 'string' && logType.length > 0 && !['operation', 'follow_up', 'contract', 'contact', 'device', 'create', 'status_flow'].includes(logType)) {
    return logType;
  }

  // 历史数据兼容：detail 含 "->" 的记录修正为"状态变更"
  if (detail && detail.includes('->')) {
    return '状态变更';
  }

  return logType || '其他';
}

async function renderOperationLogs() {
  try {
    const res = await API.getOperationLogs();
    if (!res || !res.success) return;

    operationLogs = res.data || [];
    const tbody = document.getElementById('operationLogs-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (operationLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无操作日志</td></tr>';
      return;
    }

    for (const log of operationLogs) {
      const actionName = mapLogType(log);
      const badgeClass = logTypeBadgeMap[log.logType] || logTypeBadgeMap[actionName] || 'badge-gray';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${log.created_at || '-'}</td>
        <td>${log.user_name || '-'}</td>
        <td><span class="badge ${badgeClass}">${actionName}</span></td>
        <td>${log.target || '-'}</td>
        <td>${log.detail || '-'}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (e) {
    console.error('加载操作日志失败:', e);
  }
}

/* ==================== 数据管理渲染 ==================== */

// 将 action_type 映射为显示名称和 badge 类型
function mapDataType(actionType) {
  const map = {
    'import': { name: '数据导入', badge: 'badge-purple' },
    'import_school': { name: '学校数据导入', badge: 'badge-purple' },
    'import_follow_record': { name: '工作记录导入', badge: 'badge-purple' },
    'import_operation_record': { name: '工作记录导入', badge: 'badge-purple' },
    '数据导入': { name: '数据导入', badge: 'badge-purple' },
    '数据导出': { name: '数据导出', badge: 'badge-blue' },
    'export': { name: '数据导出', badge: 'badge-blue' },
    'sync': { name: '数据同步', badge: 'badge-purple' },
    'backup': { name: '数据备份', badge: 'badge-yellow' },
  };
  return map[actionType] || { name: actionType || '其他', badge: 'badge-gray' };
}

function mapDataStatus(status) {
  const map = {
    'success': { text: '成功', badge: 'badge-green' },
    'partial': { text: '部分成功', badge: 'badge-yellow' },
    'completed': { text: '已完成', badge: 'badge-green' },
    'failed': { text: '失败', badge: 'badge-red' },
    'pending': { text: '处理中', badge: 'badge-yellow' },
  };
  return map[status] || { text: status || '未知', badge: 'badge-gray' };
}

async function renderDataManagement() {
  try {
    const res = await API.getDataManagement();
    if (!res || !res.success) return;

    dataItems = res.data || [];
    const tbody = document.getElementById('dataManagement-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (dataItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无数据</td></tr>';
      return;
    }

    for (const item of dataItems) {
      const typeInfo = mapDataType(item.action_type);
      const statusInfo = mapDataStatus(item.status);
      const tr = document.createElement('tr');

      // 根据操作类型确定操作列内容
      let actionHtml;
      if (item.action_type === 'export' && (item.status === 'success' || item.status === 'completed')) {
        actionHtml = `<span class="text-link" onclick="downloadData(${JSON.stringify({ name: item.file_name }).replace(/"/g, '&quot;')})">下载</span>`;
      } else {
        actionHtml = `<span class="text-link" onclick="viewData(${JSON.stringify({ name: item.file_name, desc: item.detail, date: item.created_at }).replace(/"/g, '&quot;')})">查看</span>`;
      }

      tr.innerHTML = `
        <td>${item.file_name || '-'}</td>
        <td><span class="badge ${typeInfo.badge}">${typeInfo.name}</span></td>
        <td>${item.created_at || '-'}</td>
        <td><span class="badge ${statusInfo.badge}">${statusInfo.text}</span></td>
        <td>${actionHtml}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (e) {
    console.error('加载数据管理失败:', e);
  }
}

/* ==================== 学校字典 ==================== */

let schoolDictSearchText = '';

function renderSchoolDictionaryTable() {
  const tbody = document.getElementById('schoolDict-tbody');
  if (!tbody) return;

  const filtered = schoolDictData.filter(s => {
    if (!schoolDictSearchText) return true;
    return s.name.includes(schoolDictSearchText) || s.region.includes(schoolDictSearchText);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:48px;color:#999;">暂无数据</td></tr>';
    return;
  }

  const levelBadge = { '小学': 'badge-blue', '初中': 'badge-purple', '高中': 'badge-orange', '九年一贯': 'badge-green', '十二年一贯': 'badge-green', '幼儿园': 'badge-pink', '完全中学': 'badge-green' };
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
  initProvinceOptions();
  document.getElementById('schoolFormModalTitle').textContent = '新增学校';
  document.getElementById('schoolEditId').value = '';
  document.getElementById('schoolFormName').value = '';
  document.getElementById('schoolFormProvince').value = '';
  document.getElementById('schoolFormCity').innerHTML = '<option value="">请选择城市</option>';
  document.getElementById('schoolFormCity').disabled = true;
  document.getElementById('schoolFormLevel').value = '';
  document.getElementById('schoolFormType').value = '';
  openModal('schoolFormModal');
}

function editSchool(id) {
  initProvinceOptions();
  const school = schoolDictData.find(s => s.id === id);
  if (!school) return;

  document.getElementById('schoolFormModalTitle').textContent = '编辑学校';
  document.getElementById('schoolEditId').value = school.id;
  document.getElementById('schoolFormName').value = school.name;

  // 解析区域 "省份-城市" 格式
  if (school.region) {
    const parts = school.region.split('-');
    const prov = parts[0] || '';
    const cit = parts[1] || '';
    document.getElementById('schoolFormProvince').value = prov;
    triggerCitySelect(prov);
    setTimeout(() => {
      document.getElementById('schoolFormCity').value = cit;
    }, 50);
  } else {
    document.getElementById('schoolFormProvince').value = '';
    document.getElementById('schoolFormCity').innerHTML = '<option value="">请选择城市</option>';
    document.getElementById('schoolFormCity').disabled = true;
  }

  document.getElementById('schoolFormLevel').value = school.level;
  document.getElementById('schoolFormType').value = school.type;
  openModal('schoolFormModal');
}

async function saveSchool() {
  const editId = document.getElementById('schoolEditId').value;
  const name = document.getElementById('schoolFormName').value.trim();
  const province = document.getElementById('schoolFormProvince').value;
  const city = document.getElementById('schoolFormCity').value;
  const level = document.getElementById('schoolFormLevel').value;
  const type = document.getElementById('schoolFormType').value;

  if (!name || !province || !city || !level || !type) {
    alert('请填写所有必填项');
    return;
  }

  const region = province + '-' + city;

  let res;
  if (editId) {
    // 编辑
    res = await API.updateSchoolDict(parseInt(editId), { name, region, grade: level, type });
  } else {
    // 新增
    res = await API.createSchoolDict({ name, region, grade: level, type, dept: '' });
  }

  closeModal('schoolFormModal');

  if (res && res.success === true) {
    await loadData();
    renderSchoolDictionaryTable();
    showToast(editId ? '学校已更新' : '学校已创建', 'success');
  } else {
    showToast('操作失败，请重试', 'error');
  }
}

function confirmSchoolDelete(id, name) {
  document.getElementById('deleteSchoolName').textContent = name;
  document.getElementById('deleteConfirmBtn').dataset.targetId = id;
  openModal('deleteConfirmModal');
}

async function doDeleteSchool() {
  const id = parseInt(document.getElementById('deleteConfirmBtn').dataset.targetId);
  const res = await API.deleteSchoolDict(id);
  closeModal('deleteConfirmModal');
  if (res && res.success === true) {
    await loadData();
    renderSchoolDictionaryTable();
    showToast('学校已删除', 'success');
  } else {
    showToast('删除失败，请重试', 'error');
  }
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

async function confirmBatchImport() {
  if (!batchImportFile) return;

  const btn = document.getElementById('batchImportConfirmBtn');
  btn.disabled = true;
  btn.textContent = '导入中...';

  try {
    const res = await API.uploadImport('/api/school-dict/import', batchImportFile);

    btn.disabled = false;
    btn.textContent = '开始导入';
    closeModal('batchImportModal');

    if (res && res.success === true) {
      const d = res.data;
      await loadData();
      renderSchoolDictionaryTable();

      // 组装提示信息
      let msg = '导入完成\n\n';
      msg += '✅ 成功: ' + d.success_count + ' 条\n';
      if (d.duplicate_count > 0) {
        msg += '⚠️ 重复跳过: ' + d.duplicate_count + ' 条\n';
      }
      if (d.skip_count > 0) {
        msg += '⚠️ 空行跳过: ' + d.skip_count + ' 条\n';
      }
      if (d.errors && d.errors.length > 0) {
        msg += '\n错误详情:\n' + d.errors.join('\n');
      }
      alert(msg);
    } else {
      alert('导入失败: ' + (res && res.message ? res.message : '未知错误'));
    }
  } catch (e) {
    btn.disabled = false;
    btn.textContent = '开始导入';
    alert('导入失败: ' + e.message);
  }
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

/* ==================== Nav Group Toggle ==================== */

function toggleNavGroup(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.toggle('collapsed');
  }
}

/* ==================== Dashboard 渲染 ==================== */

// 格式化计划执行时间：2026-11-12 → 11月12日 周三
function formatPlanDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

// 渲染本周工作计划
function renderWeekPlans(plans) {
  const container = document.getElementById('weekPlanList');
  if (!container) return;

  if (!plans || plans.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无本周工作计划</div></div>';
    return;
  }

  container.innerHTML = plans.map(p => `
    <div class="week-plan-item">
      ${p.plan_time ? `<div class="week-plan-date">${formatPlanDate(p.plan_time)}</div>` : ''}
      <div class="week-plan-content">${p.content || '-'}</div>
      ${p.plan_goal ? `<div class="week-plan-goal">目标：${p.plan_goal}</div>` : ''}
    </div>
  `).join('');
}

async function renderEmployeeDashboard() {
  try {
    const [res, weekPlanRes] = await Promise.all([
      API.getEmployeeDashboard(),
      API.getWeekPlan(),
    ]);
    console.log('[工作台] API返回:', JSON.stringify(res, null, 2));
    if (!res || !res.success) {
      console.error('[工作台] API返回失败:', res);
      return;
    }

    const { stats, recentRecords, overdueWarnings, targetProgress } = res.data;
    console.log('[工作台] stats:', stats, 'recentRecords:', recentRecords.length, 'overdueWarnings:', overdueWarnings.length, 'targetProgress:', targetProgress);

    // 更新统计卡片（防御空值）
    const el = (id) => document.getElementById(id);
    const s = stats || {};
    const totalSchools = s.totalSchools ?? 0;
    const monthSigned = s.monthSigned ?? 0;
    const negotiating = s.negotiating ?? 0;
    const overdueCount = s.overdueCount ?? 0;
    const opsCount = s.opsCount ?? 0;
    const monthlyTarget = s.monthlyTarget ?? 0;
    const intendingCount = s.intendingCount ?? 0;
    const discussingCount = s.discussingCount ?? 0;

    if (el('statTotalSchools')) el('statTotalSchools').textContent = totalSchools;
    if (el('statSignedSchools')) el('statSignedSchools').textContent = monthSigned;
    if (el('statNegotiatingSchools')) el('statNegotiatingSchools').textContent = negotiating;
    if (el('statOverdueWarnings')) el('statOverdueWarnings').textContent = overdueCount;

    // 更新统计卡片副标题
    if (el('statTotalSchoolsSub')) el('statTotalSchoolsSub').textContent = `运营 ${opsCount} 所`;
    if (el('statSignedSchoolsSub')) el('statSignedSchoolsSub').textContent = `目标 ${monthlyTarget ?? 0} 所`;
    if (el('statNegotiatingSchoolsSub')) el('statNegotiatingSchoolsSub').textContent = `有意向 ${intendingCount} / 沟通 ${discussingCount}`;
    if (el('statOverdueWarningsSub')) el('statOverdueWarningsSub').textContent = '>15天 严重';

    // 渲染超期预警列表
    const overdueContainer = el('overdueWarningsList');
    if (overdueContainer) {
      overdueContainer.innerHTML = '';
      if (overdueWarnings.length === 0) {
        overdueContainer.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无超期预警</div></div>';
      } else {
        overdueWarnings.forEach((w) => {
          const item = document.createElement('div');
          item.className = 'warning-item';
          const days = w.overdue_days || 0;
          const isSevere = w.level === '严重';
          item.innerHTML = `
            <div class="warning-dot ${isSevere ? '' : 'warn'}"></div>
            <div class="warning-info">
              <div class="warning-name">${w.name}</div>
              <div class="warning-desc">${days}天未跟进</div>
            </div>
            <button class="btn btn-sm btn-ghost" onclick="openSchoolDetail(${w.id})">去跟进</button>
            <span class="warning-tag ${isSevere ? 'red' : 'yellow'}">${w.level}</span>
          `;
          overdueContainer.appendChild(item);
        });
      }
    }

    // 渲染最近工作记录
    const followUpBody = el('recentFollowUpsBody');
    if (followUpBody) {
      followUpBody.innerHTML = '';
      if (recentRecords.length === 0) {
        followUpBody.innerHTML = '<tr><td colspan="4" class="empty-state"><div class="empty-state-text">暂无工作记录</div></td></tr>';
      } else {
        recentRecords.forEach((r) => {
          const row = document.createElement('tr');
          const time = r.created_at ? r.created_at.replace('T', ' ').slice(0, 16) : '-';
          let content = r.content || '-';
          if (content !== '-' && content.length > 50) content = content.substring(0, 50) + '...';
          let nextStep = r.next_step || '-';
          if (nextStep !== '-' && nextStep.length > 30) nextStep = nextStep.substring(0, 30) + '...';
          row.innerHTML = `
            <td>${time}</td>
            <td><span class="text-link" onclick="openSchoolDetail(${r.school_id})">${r.school_name}</span></td>
            <td style="color:#475569;font-size:13px;">${content}</td>
            <td style="color:#475569;font-size:13px;">${nextStep}</td>
          `;
          followUpBody.appendChild(row);
        });
      }
    }

    // 渲染目标进度
    renderTargetProgress(targetProgress);

    // 渲染本周工作计划
    renderWeekPlans(weekPlanRes && weekPlanRes.success ? weekPlanRes.data : []);

    // 渲染负责学校表格
    const schoolsTable = el('operatorSchoolsTableBody');
    if (schoolsTable) {
      schoolsTable.innerHTML = '';
      const mySchools = schoolsData.filter(s => s.employee_id === currentUser.id);
      if (mySchools.length === 0) {
        schoolsTable.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="empty-state-text">暂无负责学校</div></td></tr>';
      } else {
        mySchools.forEach((s) => {
          const row = document.createElement('tr');
          const lastWorkTime = s.last_work_at ? s.last_work_at.slice(0, 10) : '-';
          const lastWorkContent = s.last_work_content ? (s.last_work_content.length > 40 ? s.last_work_content.substring(0, 40) + '...' : s.last_work_content) : '-';
          row.innerHTML = `
            <td><span class="text-link" onclick="openSchoolDetail(${s.id})">${s.name}</span></td>
            <td><span class="badge ${getStatusBadge(s.status)}">${s.status}</span></td>
            <td>${lastWorkTime}</td>
            <td style="color:#475569;font-size:13px;">${lastWorkContent}</td>
            <td><a href="javascript:void(0)" style="color:#3b82f6;text-decoration:none;font-size:14px;cursor:pointer;font-weight:500;" onclick="openSchoolDetail(${s.id})">详情</a></td>
          `;
          schoolsTable.appendChild(row);
        });
      }
    }
  } catch (e) {
    console.error('[工作台] 加载失败:', e);
    console.error('[工作台] 错误堆栈:', e.stack);
  }
}

/* ==================== Init ==================== */

document.addEventListener('DOMContentLoaded', async function () {
  // 从 URL 参数读取 token（飞书 OAuth 回调）
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  if (urlToken) {
    localStorage.setItem('token', urlToken);
    // 清除 URL 中的 token 参数，避免刷新页面重复携带
    window.history.replaceState(null, '', window.location.pathname);
  }

  // 检查登录状态
  if (!requireAuth()) {
    return;
  }

  // 获取当前用户信息（飞书 OAuth 登录后 localStorage 中没有 user 信息）
  if (!API.getUser()) {
    const userinfoRes = await API.getUserinfo();
    if (userinfoRes && userinfoRes.success) {
      localStorage.setItem('user', JSON.stringify(userinfoRes.data));
      currentUser = userinfoRes.data;
    }
  }

  // 加载数据
  await loadData();

  // 恢复侧边栏状态
  const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === '1';
  if (sidebarCollapsed) {
    document.getElementById('sidebar').classList.add('collapsed');
    document.body.classList.add('collapsed');
  }

  // 根据角色渲染侧边栏菜单
  renderSidebarMenus(currentUser.menus);

  // 根据 URL hash 或用户角色自动切换到默认视图
  (function () {
    let defaultView;
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'salesDashboard' && hash !== 'operatorDashboard') {
      defaultView = hash;
    } else {
      defaultView = 'dashboard';
    }
    const navEl = document.querySelector(`[data-view="${defaultView}"]`);
    showView(defaultView, navEl);
  })();

  // 更新左下角用户信息
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const avatarEl = document.getElementById('userAvatar');
  if (nameEl) nameEl.textContent = currentUser.name || '';
  if (roleEl) roleEl.textContent = currentUser.role || '';
  if (avatarEl) avatarEl.textContent = (currentUser.name || '?').charAt(0);

  // 移动端右上角用户头像
  initMobileUserHeader();

  renderRecordsTable();
  renderSchoolsTable();
  renderUsersTable();
  initSchoolFilters();
  initAllowPwdToggles();
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
  // 交接给员工按钮 - 仅已签约状态显示
  updateDetailButtonsVisibility();
  // 学校详情页状态流转条初始化
  renderStatusFlow();
  updateFlowButtonsVisibility();

  // 根据角色加载 Dashboard
  if (currentUser.role === '员工' || currentUser.role === '一级部门负责人' || currentUser.role === '超级管理员') {
    await renderEmployeeDashboard();
  }
});

/* ===================== 学校详情页按钮按角色显示 ===================== */

function updateDetailButtonsVisibility() {
  const role = currentUser && currentUser.role;
  const workRecordBtn = document.getElementById('detailWorkRecordBtn');

  // 员工、超管、部门负责人：都显示"写工作记录"
  const showWorkRecord = ['员工', '超级管理员', '一级部门负责人'].includes(role);

  if (workRecordBtn) workRecordBtn.style.display = showWorkRecord ? '' : 'none';
}

function openHandoverModal() {
  // 动态加载员工用户列表
  const opSelect = document.getElementById('handoverOperator');
  const note = document.getElementById('handoverNote');
  if (opSelect) {
    opSelect.innerHTML = '<option value="">请选择员工</option>';
    const employees = usersData.filter(u => u.role === '员工');
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = emp.name;
      opSelect.appendChild(option);
    });
    opSelect.value = '';
  }
  if (note) note.value = '';
  openModal('handoverModal');
}

async function submitHandover() {
  const opSelect = document.getElementById('handoverOperator');
  const note = document.getElementById('handoverNote');
  const operatorId = opSelect.value;
  const handoverNote = note.value.trim();

  // 校验
  if (!operatorId) {
    showToast('请选择交接给哪个员工', 'error');
    return;
  }

  try {
    const res = await API.handoverSchool(schoolDetail.id, parseInt(operatorId), handoverNote);
    if (res.success) {
      closeModal('handoverModal');
      showToast('交接申请已提交，等待员工确认', 'success');
      // 更新本地状态
      schoolDetail.status = '交接中';
      schoolDetail.assigned_operator_id = parseInt(operatorId);
      schoolDetail.handover_notes = handoverNote;
      // 重新加载学校详情
      await loadSchoolDetail(schoolDetail.id);
      await loadData();
    } else {
      showToast(res.message || '交接申请失败', 'error');
    }
  } catch (err) {
    showToast('交接申请失败：' + err.message, 'error');
  }
}

function addHandoverItem(school) {
  const container = document.getElementById('pendingHandoverList');
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'warning-item';
  item.id = `pendingHandover-${school.id}`;
  item.innerHTML = `
    <div class="warning-dot warn"></div>
    <div class="warning-info">
      <div class="warning-name">${school.name}</div>
      <div class="warning-desc">销售：${school.sales_name || '-'}${school.handover_notes ? ' - ' + school.handover_notes : ''}</div>
    </div>
    <span class="warning-tag yellow">待确认</span>
    <div style="display:flex;gap:6px;flex-shrink:0;">
      <button class="btn btn-primary btn-xs" onclick="requestConfirmHandover(${school.id}, '${school.name.replace(/'/g, "\\'")}')">确认接收</button>
      <button class="btn btn-xs" style="background:#dc2626;color:#fff;" onclick="openRejectHandoverModal(${school.id}, '${school.name.replace(/'/g, "\\'")}')">拒绝</button>
    </div>
  `;
  container.appendChild(item);
}

function requestConfirmHandover(schoolId, schoolName) {
  openConfirmModal(
    `确定要接收"${schoolName}"吗？确认后状态将变为"运营中"`,
    async (confirmed) => {
      if (confirmed) {
        await confirmHandover(schoolId, schoolName);
      }
    },
    'info'
  );
}

async function confirmHandover(schoolId, schoolName) {
  try {
    const res = await API.acceptHandover(schoolId);
    if (res.success) {
      // 移除待交接项
      const item = document.getElementById(`pendingHandover-${schoolId}`);
      if (item) item.remove();

      showToast(`已确认接收"${schoolName}"，状态已更新为"运营中"`, 'success');
      await loadData();
      await renderEmployeeDashboard();

      // 如果当前在详情页且是同一所学校，刷新详情
      if (currentPage === 'schoolDetail' && schoolDetail && schoolDetail.id === schoolId) {
        await loadSchoolDetail(schoolId);
      }
    } else {
      showToast(res.message || '确认接收失败', 'error');
    }
  } catch (err) {
    showToast('确认接收失败：' + err.message, 'error');
  }
}

/**
 * 运营在详情页直接确认接收当前学校（交接中→运营中）
 */
function confirmCurrentSchoolHandover() {
  if (!schoolDetail) return;
  requestConfirmHandover(schoolDetail.id, schoolDetail.name);
}

// 打开拒绝交接弹窗
function openRejectHandoverModal(schoolId, schoolName) {
  document.getElementById('rejectHandoverSchoolId').value = schoolId;
  document.getElementById('rejectHandoverSchoolName').textContent = schoolName;
  document.getElementById('rejectHandoverReason').value = '';
  openModal('rejectHandoverModal');
}

async function submitRejectHandover() {
  const schoolId = parseInt(document.getElementById('rejectHandoverSchoolId').value);
  const reason = document.getElementById('rejectHandoverReason').value.trim();

  if (!reason) {
    showToast('请填写拒绝原因', 'error');
    return;
  }

  try {
    const res = await API.rejectHandover(schoolId, reason);
    if (res.success) {
      closeModal('rejectHandoverModal');
      // 移除待交接项
      const item = document.getElementById(`pendingHandover-${schoolId}`);
      if (item) item.remove();

      showToast('已拒绝交接，学校状态已回到"已签约"', 'success');
      await loadData();
      await renderEmployeeDashboard();

      // 如果当前在详情页且是同一所学校，刷新详情
      if (currentPage === 'schoolDetail' && schoolDetail && schoolDetail.id === schoolId) {
        await loadSchoolDetail(schoolId);
      }
    } else {
      showToast(res.message || '拒绝交接失败', 'error');
    }
  } catch (err) {
    showToast('拒绝交接失败：' + err.message, 'error');
  }
}

// 销售侧：查看交接状态详情
function openHandoverInfoModal() {
  if (!schoolDetail) return;

  const operatorEl = document.getElementById('handoverInfoOperator');
  const timeEl = document.getElementById('handoverInfoTime');
  const noteEl = document.getElementById('handoverInfoNote');
  const statusEl = document.getElementById('handoverInfoStatus');
  const rejectSection = document.getElementById('handoverInfoRejectSection');
  const rejectEl = document.getElementById('handoverInfoRejectReason');

  operatorEl.textContent = schoolDetail.assigned_operator_name || '-';
  timeEl.textContent = schoolDetail.handover_time || '-';
  noteEl.textContent = schoolDetail.handover_notes || '无';

  if (schoolDetail.status === '交接中') {
    statusEl.innerHTML = '<span class="badge badge-yellow">等待员工确认</span>';
    rejectSection.style.display = 'none';
  } else if (schoolDetail.status === '运营中' && schoolDetail.operator_id) {
    statusEl.innerHTML = '<span class="badge badge-green">交接成功</span>';
    rejectSection.style.display = 'none';
  } else if (schoolDetail.status === '已签约' && schoolDetail.reject_reason) {
    statusEl.innerHTML = '<span class="badge badge-red">交接已被拒绝</span>';
    rejectSection.style.display = '';
    rejectEl.textContent = schoolDetail.reject_reason;
  }

  openModal('handoverInfoModal');
}

/* ==================== 工作管理（员工角色） ==================== */

// 当前工作汇报状态
let workReportState = {
  reportId: null,
  reportType: null,
  period: null,
  isViewMode: false,      // 是否为查看详情模式
  workRecords: [],        // 工作记录
  nextWeekPlans: [],      // 下周计划
  mySchools: [],          // 自己负责的学校列表
  targetFollow: 20,
  targetNewSchool: 5,
  targetSigned: 3,
  doneFollow: 0,
  doneNewSchool: 0,
  doneSigned: 0,
  cumulativeFollow: 0,    // 本月累计拜访次数
  cumulativeNewSchool: 0, // 本月累计签约学校数
  cumulativeSigned: 0,    // 本月累计销售金额
  baseCumulativeFollow: 0,    // 不含本周的累计拜访次数
  baseCumulativeNewSchool: 0, // 不含本周的累计签约学校数
  baseCumulativeSigned: 0,    // 不含本周的累计销售金额
  hasMonthlyGoal: false,  // 是否已设置月度目标
  notes: '',              // 补充说明（选填）
};

// 渲染工作汇报列表
async function renderWorkReportsList() {
  const tbody = document.getElementById('workReports-tbody');
  if (!tbody) return;

  // 移动端：渲染本周卡片与历史汇报列表
  if (isMobileView()) renderMobileWorkReports();

  const typeFilter = document.getElementById('wrTypeFilter')?.value || '';
  const statusFilter = document.getElementById('wrStatusFilter')?.value || '';

  try {
    const params = {};
    if (typeFilter) params.reportType = typeFilter;

    const res = await API.getWorkReports(params);
    if (!res.success) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-24">加载失败</td></tr>`;
      return;
    }

    let list = res.data || [];
    if (statusFilter) {
      list = list.filter(r => r.status === statusFilter);
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-24">暂无汇报记录</td></tr>`;
      return;
    }

    const isManager = currentUser.role === '超级管理员' || currentUser.role === '部门主管';
    tbody.innerHTML = list.map(r => {
      const statusTag = r.status === '已提交'
        ? '<span class="tag tag-success">已提交</span>'
        : '<span class="tag tag-warning">草稿</span>';
      const submitTime = r.submitted_at ? r.submitted_at.slice(0, 16).replace('T', ' ') : '-';
      const canEdit = isManager || (r.user_id === currentUser.id && r.status === '草稿');
      return `
        <tr>
          <td>${r.user_name || ''}</td>
          <td>${r.report_type || ''}</td>
          <td>${r.period || ''}</td>
          <td>${r.follow_count || 0}</td>
          <td>${r.new_school_count || 0}</td>
          <td>${r.signed_school_count || 0}</td>
          <td>${statusTag}</td>
          <td>${submitTime}</td>
          <td>
            <button class="btn-link" onclick="viewWorkReportDetail(${r.id})">查看详情</button>
            ${canEdit ? `<button class="btn-link" onclick="editWorkReport(${r.id})">编辑</button>` : ''}
            ${canEdit ? `<button class="btn-link btn-danger" onclick="deleteWorkReport(${r.id})">删除</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('renderWorkReportsList error:', err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-24">加载失败</td></tr>`;
  }
}

// ==================== 移动端工作汇报 ====================

function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function formatWeekRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const s = new Date(startDate);
  const e = new Date(endDate);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(s.getMonth() + 1)}.${pad(s.getDate())} - ${pad(e.getMonth() + 1)}.${pad(e.getDate())}`;
}

function formatGoalMonth(month) {
  if (!month) return '';
  const parts = String(month).split('-');
  if (parts.length < 2) return month;
  return `${parts[0]}年${parseInt(parts[1], 10)}月`;
}

// 移动端：切换 汇报记录 / 目标设置
function switchMobileWrTab(tab, el) {
  document.querySelectorAll('.mobile-wr-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  const reportsPane = document.getElementById('mobileWrReportsPane');
  const goalsPane = document.getElementById('mobileWrGoalsPane');
  if (reportsPane) reportsPane.style.display = tab === 'reports' ? 'block' : 'none';
  if (goalsPane) goalsPane.style.display = tab === 'goals' ? 'block' : 'none';
  if (tab === 'reports') renderMobileWorkReports();
  if (tab === 'goals') renderMobileGoals();
}

// 移动端：开始填写本周汇报
function startMobileWeeklyReport() {
  selectReportType('周度汇报');
}

// 移动端：从汇报表单/详情返回列表
function backFromWorkReportForm() {
  showView('workReportsList', document.querySelector('[data-view="workReportsList"]'));
}

// 移动端：渲染本周卡片 + 历史汇报
async function renderMobileWorkReports() {
  const cardEl = document.getElementById('mobileWeeklyCard');
  const listEl = document.getElementById('mobileReportHistoryList');
  if (!cardEl || !listEl) return;

  cardEl.innerHTML = '<div class="mw-loading">加载中...</div>';
  listEl.innerHTML = '';

  try {
    const periodRes = await API.getWorkReportCurrentPeriod('周度汇报');
    const periodInfo = (periodRes && periodRes.success) ? periodRes.data : null;
    const currentPeriod = periodInfo ? periodInfo.period : '';

    const listRes = await API.getWorkReports({ reportType: '周度汇报' });
    const list = (listRes && listRes.success) ? (listRes.data || []) : [];

    const current = list.find(r => r.period === currentPeriod);
    const isSubmitted = current && current.status === '已提交';
    const weekRange = formatWeekRange(periodInfo && periodInfo.startDate, periodInfo && periodInfo.endDate);

    if (isSubmitted) {
      const submitTime = current.submitted_at ? current.submitted_at.slice(0, 16).replace('T', ' ') : '';
      cardEl.innerHTML = `
        <div class="mw-week-card submitted">
          <div class="mw-week-tag">已提交</div>
          <div class="mw-week-title">${currentPeriod || '本周'}</div>
          <div class="mw-week-desc">${weekRange}${submitTime ? ' · ' + submitTime : ''}</div>
          <button class="mw-week-btn" onclick="viewWorkReportDetail(${current.id})">查看详情</button>
        </div>`;
    } else {
      const btnAction = current ? `editWorkReport(${current.id})` : 'startMobileWeeklyReport()';
      const btnText = '填写本周汇报';
      cardEl.innerHTML = `
        <div class="mw-week-card">
          <div class="mw-week-tag">本周待填写</div>
          <div class="mw-week-title">${currentPeriod || '本周'}</div>
          <div class="mw-week-desc">${weekRange ? weekRange + '，' : ''}还没提交本周汇报</div>
          <button class="mw-week-btn" onclick="${btnAction}">${btnText}</button>
        </div>`;
    }

    const history = list.filter(r => r.period !== currentPeriod)
      .sort((a, b) => String(b.period || '').localeCompare(String(a.period || '')));

    if (history.length === 0) {
      listEl.innerHTML = '<div class="mw-empty">暂无历史汇报</div>';
      return;
    }

    listEl.innerHTML = history.map(r => {
      const submitted = r.status === '已提交';
      const submitTime = r.submitted_at ? r.submitted_at.slice(0, 16).replace('T', ' ') : '';
      const action = submitted ? `viewWorkReportDetail(${r.id})` : `editWorkReport(${r.id})`;
      return `
        <div class="mw-report-card" onclick="${action}">
          <div class="mw-report-head">
            <div class="mw-report-period">${r.period || ''}</div>
            <div class="mw-report-tag ${submitted ? 'ok' : 'draft'}">${submitted ? '已提交' : '未提交'}</div>
          </div>
          ${submitTime ? `<div class="mw-report-time">提交时间：${submitTime}</div>` : ''}
          <div class="mw-report-metrics">
            <div class="mw-metric"><div class="mw-metric-val">${r.follow_count || 0}</div><div class="mw-metric-label">拜访次数</div></div>
            <div class="mw-metric"><div class="mw-metric-val">${r.new_school_count || 0}</div><div class="mw-metric-label">签约学校</div></div>
            <div class="mw-metric"><div class="mw-metric-val">${r.signed_school_count || 0}</div><div class="mw-metric-label">销售金额(元)</div></div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('renderMobileWorkReports error:', err);
    cardEl.innerHTML = '<div class="mw-empty">加载失败</div>';
  }
}

// 移动端：打开目标设置弹窗（使用PC端的monthlyGoalModal）
function openMobileGoalModal(goalId) {
  if (goalId) {
    editMonthlyGoal(goalId);
  } else {
    // 新建：清空表单
    monthlyGoalEditId = null;
    monthlyGoalTargetUserId = null;
    document.getElementById('monthlyGoalMonth').value = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthlyGoalVisit').value = '';
    document.getElementById('monthlyGoalNewSchool').value = '';
    document.getElementById('monthlyGoalSignedAmount').value = '';
    document.getElementById('monthlyGoalSubmitBtn').textContent = '保存';
  }
  document.getElementById('monthlyGoalModal').classList.add('show');
}

// 移动端：关闭目标设置弹窗
function closeMobileGoalModal() {
  document.getElementById('monthlyGoalModal').classList.remove('show');
}

// 移动端：渲染本月目标 + 历史目标
async function renderMobileGoals() {
  const currentEl = document.getElementById('mobileGoalCurrentCard');
  const historyEl = document.getElementById('mobileGoalHistoryList');
  if (!currentEl || !historyEl) return;

  currentEl.innerHTML = '<div class="mw-loading">加载中...</div>';
  historyEl.innerHTML = '';

  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const res = await API.getMonthlyGoals();
    const goals = (res && res.success) ? (res.data || []) : [];

    const current = goals.find(g => g.month === currentMonth);

    if (!current) {
      // 空状态
      currentEl.innerHTML = `
        <div class="mw-goal-empty">
          <div class="mw-goal-empty-icon">📋</div>
          <div class="mw-goal-empty-text">本月还没设置指标</div>
          <button class="mw-goal-empty-btn" onclick="openMobileGoalModal(null)">去设置指标</button>
        </div>`;
    } else {
      // 已设置状态
      currentEl.innerHTML = `
        <div class="mw-goal-card">
          <div class="mw-goal-card-header">
            <div class="mw-goal-card-month">本月目标（${formatGoalMonth(currentMonth)}）</div>
            <button class="mw-goal-edit-btn" onclick="openMobileGoalModal(${current.id})">修改</button>
          </div>
          <div class="mw-goal-card-body">
            <div class="mw-goal-card-item">
              <div class="mw-goal-card-val">${current.visit_goal || 0}</div>
              <div class="mw-goal-card-label">拜访次数</div>
            </div>
            <div class="mw-goal-card-item">
              <div class="mw-goal-card-val">${current.new_school_goal || 0}</div>
              <div class="mw-goal-card-label">签约学校</div>
            </div>
            <div class="mw-goal-card-item">
              <div class="mw-goal-card-val">${formatSalesAmount(current.signed_amount_goal)}</div>
              <div class="mw-goal-card-label">销售金额</div>
            </div>
          </div>
        </div>`;
    }

    const history = goals.filter(g => g.month !== currentMonth)
      .sort((a, b) => String(b.month || '').localeCompare(String(a.month || '')));

    if (history.length === 0) {
      historyEl.innerHTML = '<div class="mw-empty">暂无历史目标</div>';
      return;
    }

    historyEl.innerHTML = history.map(g => `
      <div class="mw-goal-history-item">
        <div class="mw-goal-history-header">
          <span class="mw-goal-history-month">${formatGoalMonth(g.month)}</span>
        </div>
        <div class="mw-goal-history-body">
          <div class="mw-goal-history-item-sm">
            <span class="mw-goal-history-val">${g.visit_goal || 0}</span>
            <span class="mw-goal-history-label">拜访次数</span>
          </div>
          <div class="mw-goal-history-item-sm">
            <span class="mw-goal-history-val">${g.new_school_goal || 0}</span>
            <span class="mw-goal-history-label">签约学校</span>
          </div>
          <div class="mw-goal-history-item-sm">
            <span class="mw-goal-history-val">${formatSalesAmount(g.signed_amount_goal)}</span>
            <span class="mw-goal-history-label">销售金额</span>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    console.error('renderMobileGoals error:', err);
    currentEl.innerHTML = '<div class="mw-empty">加载失败</div>';
  }
}

// 格式化销售金额显示
function formatSalesAmount(val) {
  const num = Number(val) || 0;
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString();
}

// 移动端：保存本月目标
async function saveMobileMonthlyGoal(goalId) {
  const visitEl = document.getElementById('mwGoalVisit');
  const newSchoolEl = document.getElementById('mwGoalNewSchool');
  const signedEl = document.getElementById('mwGoalSignedAmount');
  if (!visitEl || !newSchoolEl || !signedEl) return;

  const visit = visitEl.value;
  const newSchool = newSchoolEl.value;
  const signedAmount = signedEl.value;

  if (!visit || Number(visit) < 0) {
    showToast('请输入有效的拜访次数目标', 'error');
    return;
  }
  if (!newSchool || Number(newSchool) < 0) {
    showToast('请输入有效的签约学校数目标', 'error');
    return;
  }
  if (!signedAmount || Number(signedAmount) < 0) {
    showToast('请输入有效的销售金额目标', 'error');
    return;
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    const res = await API.saveMonthlyGoal({
      month: currentMonth,
      isEdit: !!goalId,
      id: goalId,
      target_user_id: null,
      visit_goal: Number(visit),
      new_school_goal: Number(newSchool),
      signed_amount_goal: Number(signedAmount)
    });
    if (res.success) {
      showToast('目标保存成功', 'success');
      renderMobileGoals();
    } else {
      showToast(res.message || '保存失败', 'error');
    }
  } catch (err) {
    console.error('saveMobileMonthlyGoal error:', err);
    showToast('保存失败', 'error');
  }
}

// 打开填写汇报类型选择弹窗
function openReportTypeModal() {
  openModal('reportTypeModal');
}

// 选择汇报类型后跳转表单
async function selectReportType(reportType) {
  closeModal('reportTypeModal');

  try {
    // 获取当前周期
    const periodRes = await API.getWorkReportCurrentPeriod(reportType);
    if (!periodRes.success) {
      showToast('获取周期信息失败', 'error');
      return;
    }
    const periodInfo = periodRes.data;

    // 检查是否已有同类型同期草稿
    const listRes = await API.getWorkReports({ reportType });
    if (listRes.success) {
      const existingDraft = listRes.data.find(r => r.period === periodInfo.period && r.status === '草稿');
      if (existingDraft) {
        // 已有草稿，直接进入编辑
        editWorkReport(existingDraft.id);
        return;
      }
    }

    // 创建新的草稿记录
    const createRes = await API.createWorkReport({
      reportType,
      period: periodInfo.period,
      items: []
    });

    if (createRes.success) {
      // 如果该周期已提交过，提示并跳转到查看页
      if (createRes.data.alreadySubmitted) {
        showToast(`您已提交过${periodInfo.period}的汇报，每周只能提交一次`, 'warning');
        viewWorkReportDetail(createRes.data.id);
        return;
      }
      workReportState.reportId = createRes.data.id;
      workReportState.reportType = reportType;
      workReportState.period = periodInfo.period;
      workReportState.isViewMode = false;
      await initWorkReportForm();
    } else {
      showToast(createRes.message || '创建汇报失败', 'error');
    }
  } catch (err) {
    console.error('selectReportType error:', err);
    showToast('创建汇报失败', 'error');
  }
}

// 编辑已有草稿
async function editWorkReport(reportId) {
  workReportState.reportId = reportId;
  workReportState.isViewMode = false;
  await initWorkReportForm();
}

// 查看汇报详情
async function viewWorkReportDetail(reportId) {
  workReportState.reportId = reportId;
  workReportState.isViewMode = true;
  await initWorkReportForm();
}

// 删除草稿汇报
async function deleteWorkReport(reportId) {
  openConfirmModal('确定要删除该汇报吗？删除后不可恢复', async (confirmed) => {
    if (!confirmed) return;
    try {
      const res = await API.deleteWorkReport(reportId);
      if (res.success) {
        showToast('汇报已删除', 'success');
        await renderWorkReportsList();
      } else {
        showToast(res.message || '删除失败', 'error');
      }
    } catch (err) {
      console.error('deleteWorkReport error:', err);
      showToast('删除失败', 'error');
    }
  });
}

// 初始化汇报表单页
async function initWorkReportForm() {
  try {
    // 切换到表单视图
    const formNav = document.querySelector('[data-view="workReportsList"]');
    showView('workReportForm', formNav);

    // 获取汇报详情
    const detailRes = await API.getWorkReport(workReportState.reportId);
    if (!detailRes.success) {
      showToast('加载汇报详情失败', 'error');
      return;
    }
    const report = detailRes.data;
    workReportState.reportType = report.report_type;
    workReportState.period = report.period;

    // 更新面包屑
    const breadcrumb = document.getElementById('wrFormBreadcrumb');
    if (breadcrumb) {
      if (workReportState.isViewMode) {
        breadcrumb.textContent = `查看 - ${report.report_type} (${report.period})`;
      } else {
        breadcrumb.textContent = `${report.report_type} - ${report.period}`;
      }
    }

    // 移动端顶部标题
    const mobileTitle = document.getElementById('wrFormMobileTitle');
    if (mobileTitle) {
      mobileTitle.textContent = workReportState.isViewMode ? '汇报详情' : '填写本周汇报';
    }

    // 控制底部操作栏显示/隐藏
    const footerBar = document.querySelector('.wr-footer-bar');
    const wrReturnBtn = document.getElementById('wrReturnBtn');
    if (footerBar) {
      if (workReportState.isViewMode) {
        footerBar.style.display = 'flex';
        if (wrReturnBtn) wrReturnBtn.style.display = 'inline-block';
        footerBar.querySelectorAll('.btn').forEach(el => {
          if (el.id !== 'wrReturnBtn') el.style.display = 'none';
        });
      } else {
        footerBar.style.display = 'flex';
        if (wrReturnBtn) wrReturnBtn.style.display = 'none';
        footerBar.querySelectorAll('.btn').forEach(el => {
          if (el.id !== 'wrReturnBtn') el.style.display = 'inline-block';
        });
      }
    }

    // 解析 items
    const items = report.items || [];
    workReportState.workRecords = items.filter(i => i.item_type === '工作记录');
    workReportState.nextWeekPlans = items.filter(i => i.item_type === '下周计划');

    // 指标统计
    workReportState.doneFollow = report.follow_count || 0;
    workReportState.doneNewSchool = report.new_school_count || 0;
    workReportState.doneSigned = report.signed_school_count || 0;
    workReportState.cumulativeFollow = report.cumulative_follow || 0;
    workReportState.cumulativeNewSchool = report.cumulative_new_school || 0;
    workReportState.cumulativeSigned = report.cumulative_signed || 0;
    // 计算不含本周的累计值（上周累计），用于实时同步计算
    workReportState.baseCumulativeFollow = Math.max(0, workReportState.cumulativeFollow - workReportState.doneFollow);
    workReportState.baseCumulativeNewSchool = Math.max(0, workReportState.cumulativeNewSchool - workReportState.doneNewSchool);
    workReportState.baseCumulativeSigned = Math.max(0, workReportState.cumulativeSigned - workReportState.doneSigned);

    // 加载补充说明
    workReportState.notes = report.notes || '';
    const wrNotesEl = document.getElementById('wrNotes');
    if (wrNotesEl) wrNotesEl.value = workReportState.notes;

    // 拉取自己负责的学校列表
    try {
      const schoolsRes = await API.getSchools();
      if (schoolsRes && schoolsRes.success) {
        workReportState.mySchools = (schoolsRes.data || []).filter(
          s => s.operator_id === currentUser.id && ['运营中'].includes(s.status)
        );
      }
    } catch (e) {
      console.error('加载负责学校列表失败:', e);
      workReportState.mySchools = [];
    }

    // 根据汇报周期动态拉取当月月度目标
    workReportState.hasMonthlyGoal = false;
    try {
      let goalMonth;
      if (workReportState.period.includes('年')) {
        // 周度格式: "2026年10月第4周" -> "2026-10"
        const match = workReportState.period.match(/(\d{4})年(\d{1,2})月/);
        goalMonth = match ? `${match[1]}-${match[2].padStart(2, '0')}` : null;
      } else {
        // 月度格式: "2026-10"
        goalMonth = workReportState.period.substring(0, 7);
      }
      if (goalMonth) {
        const goalRes = await API.getMonthlyGoal(goalMonth);
        if (goalRes && goalRes.success && goalRes.data) {
          workReportState.targetFollow = goalRes.data.visit_goal || workReportState.targetFollow;
          workReportState.targetNewSchool = goalRes.data.new_school_goal || workReportState.targetNewSchool;
          workReportState.targetSigned = goalRes.data.signed_amount_goal || workReportState.targetSigned;
          workReportState.hasMonthlyGoal = true;
        }
      }
    } catch (e) {
      console.error('加载月度目标失败:', e);
    }

    // 获取周期日期范围并显示
    try {
      const periodRes = await API.getWorkReportCurrentPeriod(workReportState.reportType);
      if (periodRes && periodRes.success && periodRes.data) {
        const { startDate, endDate } = periodRes.data;
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const startStr = `${startD.getMonth() + 1}月${startD.getDate()}日`;
        const endStr = `${endD.getMonth() + 1}月${endD.getDate()}日`;
        document.getElementById('wrPeriodInfo').textContent = `${report.period}（${startStr} - ${endStr}）`;
      } else {
        document.getElementById('wrPeriodInfo').textContent = `周期：${report.period}`;
      }
    } catch (e) {
      document.getElementById('wrPeriodInfo').textContent = `周期：${report.period}`;
    }

    // 如果是新草稿（items 为空），自动拉取工作记录和上期计划
    if (items.length === 0 && !workReportState.isViewMode) {
      await autoFillReportData();
    }

    // 渲染三个 section
    renderIndicatorsSection();
    renderWorkRecordsSection();
    renderNextWeekPlansSection();

    // 查看模式下禁用所有输入、隐藏新增和删除按钮；编辑/新建模式下恢复
    setTimeout(() => {
      if (workReportState.isViewMode) {
        document.querySelectorAll('#workReportForm-view input, #workReportForm-view textarea, #workReportForm-view select').forEach(el => {
          el.disabled = true;
        });
        // 隐藏所有包含"新增"文本的按钮
        document.querySelectorAll('#workReportForm-view .btn').forEach(el => {
          if (el.textContent.includes('新增')) el.style.display = 'none';
        });
        // 隐藏删除按钮
        document.querySelectorAll('#workReportForm-view .btn-link.text-danger').forEach(el => {
          el.style.display = 'none';
        });
        // 隐藏移动端新增按钮
        document.querySelectorAll('#workReportForm-view .mw-add-btn').forEach(el => {
          el.style.display = 'none';
        });
      } else {
        // 恢复所有输入框可用
        document.querySelectorAll('#workReportForm-view input, #workReportForm-view textarea, #workReportForm-view select').forEach(el => {
          el.disabled = false;
        });
        // 恢复所有按钮显示
        document.querySelectorAll('#workReportForm-view .btn').forEach(el => {
          el.style.display = '';
        });
        // 恢复删除按钮显示
        document.querySelectorAll('#workReportForm-view .btn-link.text-danger').forEach(el => {
          el.style.display = '';
        });
        // 恢复移动端新增按钮显示
        document.querySelectorAll('#workReportForm-view .mw-add-btn').forEach(el => {
          el.style.display = '';
        });
      }
    }, 100);
  } catch (err) {
    console.error('initWorkReportForm error:', err);
    showToast('加载表单失败', 'error');
  }
}

// 自动填充：拉取工作记录
async function autoFillReportData() {
  try {
    // 获取当前周期信息
    const periodRes = await API.getWorkReportCurrentPeriod(workReportState.reportType);
    let weekStart = null;
    let weekEnd = null;
    let monthStart = null;
    if (periodRes && periodRes.success && periodRes.data) {
      weekStart = periodRes.data.week_start;
      weekEnd = periodRes.data.week_end;
      monthStart = periodRes.data.month_start;
    }

    // 拉取本周期工作记录
    const followRes = await API.getWorkReportFollowRecords(workReportState.reportId);
    if (followRes.success && followRes.data && followRes.data.length > 0) {
      workReportState.workRecords = followRes.data.map(fr => ({
        item_type: '工作记录',
        item_date: (fr.created_at || '').slice(0, 10),
        school_name: fr.school_name || '',
        school_status: fr.school_status || fr.record_status || '',
        record_status: fr.record_status || '',
        content: fr.content || '',
        next_plan: '',
        sort_order: 0
      }));
      workReportState.doneFollow = followRes.data.length;
    }

    // 获取操作日志，统计签约学校数
    const logRes = await API.getOperationLogs({ logType: 'status_flow' });
    if (logRes && logRes.success && logRes.data) {
      const logs = logRes.data;

      // 辅助函数：判断日期是否在范围内（end 可为 null 表示无上限）
      const inRange = (dateStr, start, end) => {
        if (!dateStr) return false;
        const d = dateStr.slice(0, 10);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      };

      // 本周签约学校数：筛选 detail 包含 "->已签约" 且在本周范围内的记录
      const weekSignedLogs = logs.filter(log =>
        log.detail && log.detail.includes('->已签约') && inRange(log.created_at, weekStart, weekEnd)
      );
      workReportState.doneNewSchool = weekSignedLogs.length;

      // 本月累计拜访次数：本月所有操作日志（作为跟进数近似）
      workReportState.cumulativeFollow = logs.filter(log =>
        inRange(log.created_at, monthStart, null)
      ).length;

      // 本月累计签约学校数：本月内 "->已签约" 的记录
      const monthSignedLogs = logs.filter(log =>
        log.detail && log.detail.includes('->已签约') && inRange(log.created_at, monthStart, null)
      );
      workReportState.cumulativeNewSchool = monthSignedLogs.length;

      // 计算不含本周的累计值（上周累计）
      workReportState.baseCumulativeFollow = Math.max(0, workReportState.cumulativeFollow - workReportState.doneFollow);
      workReportState.baseCumulativeNewSchool = Math.max(0, workReportState.cumulativeNewSchool - workReportState.doneNewSchool);
      workReportState.baseCumulativeSigned = Math.max(0, workReportState.cumulativeSigned - workReportState.doneSigned);
    }
  } catch (err) {
    console.error('autoFillReportData error:', err);
  }
}

// 渲染指标 section（4-1）— 4数据点结构
function renderIndicatorsSection() {
  const targetFollow = document.getElementById('wrTargetFollow');
  if (!targetFollow) return;

  // 设置目标值
  if (workReportState.hasMonthlyGoal) {
    targetFollow.textContent = workReportState.targetFollow;
    document.getElementById('wrTargetNewSchool').textContent = workReportState.targetNewSchool;
    document.getElementById('wrTargetSigned').textContent = workReportState.targetSigned;
  } else {
    targetFollow.textContent = '未设置目标';
    document.getElementById('wrTargetNewSchool').textContent = '未设置目标';
    document.getElementById('wrTargetSigned').textContent = '未设置目标';
  }

  // 设置本周完成值（input 元素，使用 value）
  document.getElementById('wrDoneFollow').value = workReportState.doneFollow;
  document.getElementById('wrDoneNewSchool').value = workReportState.doneNewSchool;
  document.getElementById('wrDoneSigned').value = workReportState.doneSigned;

  // 设置本月累计值
  document.getElementById('wrCumulativeFollow').textContent = workReportState.cumulativeFollow;
  document.getElementById('wrCumulativeNewSchool').textContent = workReportState.cumulativeNewSchool;
  document.getElementById('wrCumulativeSigned').textContent = workReportState.cumulativeSigned;

  // 计算各指标独立进度（本月累计 / 本月目标）
  const calcProgress = (cumulative, target) => {
    const t = parseInt(target) || 0;
    if (t === 0) return 0;
    return Math.round((cumulative / t) * 100);
  };

  const setProgress = (barId, textId, percent) => {
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);
    bar.style.width = percent + '%';
    text.textContent = percent + '%';
    // 根据完成率切换颜色：≥100% 绿色，<100% 橙色
    if (percent >= 100) {
      bar.classList.add('complete');
      bar.classList.remove('warning');
    } else {
      bar.classList.add('warning');
      bar.classList.remove('complete');
    }
  };

  const pFollow = calcProgress(workReportState.cumulativeFollow, workReportState.targetFollow);
  const pNewSchool = calcProgress(workReportState.cumulativeNewSchool, workReportState.targetNewSchool);
  const pSigned = calcProgress(workReportState.cumulativeSigned, workReportState.targetSigned);

  setProgress('wrProgressFollow', 'wrProgressFollowText', pFollow);
  setProgress('wrProgressNewSchool', 'wrProgressNewSchoolText', pNewSchool);
  setProgress('wrProgressSigned', 'wrProgressSignedText', pSigned);

  // 监听"本周完成"输入框，实时更新本月累计和完成百分比
  bindIndicatorInput('wrDoneFollow', 'wrCumulativeFollow', 'wrTargetFollow',
    'wrProgressFollow', 'wrProgressFollowText',
    'baseCumulativeFollow', 'cumulativeFollow', 'targetFollow', 'doneFollow');
  bindIndicatorInput('wrDoneNewSchool', 'wrCumulativeNewSchool', 'wrTargetNewSchool',
    'wrProgressNewSchool', 'wrProgressNewSchoolText',
    'baseCumulativeNewSchool', 'cumulativeNewSchool', 'targetNewSchool', 'doneNewSchool');
  bindIndicatorInput('wrDoneSigned', 'wrCumulativeSigned', 'wrTargetSigned',
    'wrProgressSigned', 'wrProgressSignedText',
    'baseCumulativeSigned', 'cumulativeSigned', 'targetSigned', 'doneSigned');
}

// 绑定"本周完成"输入框的实时计算
function bindIndicatorInput(doneId, cumulativeId, targetId, progressId, progressTextId,
                            baseKey, cumulativeKey, targetKey, doneKey) {
  const input = document.getElementById(doneId);
  if (!input) return;

  // 只绑定一次，避免重复添加事件监听器
  if (input._boundIndicatorInput) return;
  input._boundIndicatorInput = true;

  input.addEventListener('input', function () {
    const newDone = parseInt(this.value) || 0;
    const baseCumulative = workReportState[baseKey] || 0;
    const newCumulative = baseCumulative + newDone;
    const target = parseInt(workReportState[targetKey]) || 0;

    // 更新 state
    workReportState[doneKey] = newDone;
    workReportState[cumulativeKey] = newCumulative;

    // 更新本月累计显示
    document.getElementById(cumulativeId).textContent = newCumulative;

    // 更新进度
    const percent = target === 0 ? 0 : Math.round((newCumulative / target) * 100);
    setProgressIndicator(progressId, progressTextId, percent);
  });
}

// 设置进度条显示（供 renderIndicatorsSection 和 input 事件使用）
function setProgressIndicator(barId, textId, percent) {
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);
  if (!bar || !text) return;
  bar.style.width = percent + '%';
  text.textContent = percent + '%';
  if (percent >= 100) {
    bar.classList.add('complete');
    bar.classList.remove('warning');
  } else {
    bar.classList.add('warning');
    bar.classList.remove('complete');
  }
}

// 渲染工作记录 section（4-2）
function renderWorkRecordsSection() {
  const container = document.getElementById('wrWorkRecordsList');
  if (!container) return;

  // 移动端：卡片式渲染
  if (isMobileView()) {
    if (workReportState.workRecords.length === 0) {
      container.innerHTML = `<div class="mw-empty">暂无工作记录，点击下方按钮新增</div>`;
      return;
    }
    const mobileSchoolOptions = workReportState.mySchools.map(s =>
      `<option value="${s.name || ''}"></option>`
    ).join('');
    container.innerHTML = `
      <datalist id="wrSchoolDatalist">${mobileSchoolOptions}</datalist>
    ` + workReportState.workRecords.map((r, idx) => `
      <div class="mw-record-card">
        <div class="mw-record-head">
          <input type="text" class="mw-record-school" list="wrSchoolDatalist" value="${r.school_name || ''}" placeholder="学校名称" autocomplete="off" onchange="updateWorkRecord(${idx}, 'school_name', this.value)">
          <button class="mw-record-del btn-link text-danger" onclick="removeWorkRecord(${idx})">×</button>
        </div>
        <div class="mw-record-meta">
          <input type="date" class="mw-record-date" value="${r.item_date || ''}" onchange="updateWorkRecord(${idx}, 'item_date', this.value)">
          <span class="badge ${getStatusBadge(r.school_status)}">${r.school_status || '未设置状态'}</span>
        </div>
        <div class="mw-field-group">
          <div class="mw-field-label">跟进内容</div>
          <textarea class="mw-record-content" rows="2" placeholder="跟进内容" onchange="updateWorkRecord(${idx}, 'content', this.value)">${r.content || ''}</textarea>
        </div>
        <div class="mw-field-group">
          <div class="mw-field-label">下一步计划</div>
          <input type="text" class="mw-nextplan-input" value="${r.next_plan || ''}" placeholder="下一步计划" onchange="updateWorkRecord(${idx}, 'next_plan', this.value)">
        </div>
      </div>
    `).join('');
    return;
  }

  if (workReportState.workRecords.length === 0) {
    container.innerHTML = `<div class="wr-empty text-center text-muted py-24">暂无工作记录，点击上方按钮新增</div>`;
    return;
  }

  const schoolOptions = workReportState.mySchools.map(s =>
    `<option value="${s.name || ''}"></option>`
  ).join('');

  container.innerHTML = `
    <datalist id="wrSchoolDatalist">${schoolOptions}</datalist>
    <div class="wr-table-header wr-record-row">
      <div class="wr-row-index" style="background:#6b7280">#</div>
      <div class="wr-record-body">
        <span class="wr-header-cell wr-f-date">日期</span>
        <span class="wr-header-cell wr-f-school">客户名称</span>
        <span class="wr-header-cell wr-f-status">当前状态</span>
        <span class="wr-header-cell wr-f-content">过程和结果</span>
        <span class="wr-header-cell wr-f-nextplan">后续计划</span>
        <span class="wr-header-cell wr-f-delete"></span>
      </div>
    </div>
  ` + workReportState.workRecords.map((r, idx) => `
    <div class="wr-record-row">
      <div class="wr-row-index">${idx + 1}</div>
      <div class="wr-record-body">
        <input type="date" class="form-input wr-f wr-f-date" value="${r.item_date || ''}" onchange="updateWorkRecord(${idx}, 'item_date', this.value)">
        <input type="text" class="form-input wr-f wr-f-school" list="wrSchoolDatalist" value="${r.school_name || ''}" placeholder="客户名称" autocomplete="off" onchange="updateWorkRecord(${idx}, 'school_name', this.value)">
        <span class="wr-f wr-f-status ${r.school_status ? 'badge ' + getStatusBadge(r.school_status) : 'text-muted'}">${r.school_status || '-'}</span>
        <input type="text" class="form-input wr-f wr-f-content" value="${r.content || ''}" placeholder="过程和结果" onchange="updateWorkRecord(${idx}, 'content', this.value)">
        <input type="text" class="form-input wr-f wr-f-nextplan" value="${r.next_plan || ''}" placeholder="后续计划" onchange="updateWorkRecord(${idx}, 'next_plan', this.value)">
        <button class="wr-f-delete btn-link text-danger" onclick="removeWorkRecord(${idx})">删除</button>
      </div>
    </div>
  `).join('');
}

// 更新某条工作记录字段
function updateWorkRecord(idx, field, value) {
  if (workReportState.workRecords[idx]) {
    workReportState.workRecords[idx][field] = value;
  }
}

// 新增工作记录行
function addWorkRecordRow() {
  workReportState.workRecords.push({
    item_type: '工作记录',
    item_date: new Date().toISOString().slice(0, 10),
    school_name: '',
    school_status: '',
    record_status: '',
    content: '',
    next_plan: '',
    sort_order: workReportState.workRecords.length
  });
  renderWorkRecordsSection();
}

// 删除工作记录行
function removeWorkRecord(idx) {
  workReportState.workRecords.splice(idx, 1);
  renderWorkRecordsSection();
}

// 渲染下周计划 section（4-3）
function renderNextWeekPlansSection() {
  const container = document.getElementById('wrNextWeekPlansList');
  if (!container) return;

  // 移动端：卡片式渲染
  if (isMobileView()) {
    if (workReportState.nextWeekPlans.length === 0) {
      container.innerHTML = `<div class="mw-empty">暂无计划，点击下方按钮新增</div>`;
      return;
    }
    container.innerHTML = workReportState.nextWeekPlans.map((p, idx) => `
      <div class="mw-plan-card">
        <div class="mw-plan-head">
          <span class="mw-plan-index">计划 ${idx + 1}</span>
          <button class="btn-link text-danger mw-plan-del" onclick="removeNextWeekPlan(${idx})">删除</button>
        </div>
        <div class="mw-field-group">
          <div class="mw-field-label">工作事项</div>
          <input type="text" class="mw-plan-input" value="${p.content || ''}" placeholder="工作事项" onchange="updateNextWeekPlan(${idx}, 'content', this.value)">
        </div>
        <div class="mw-field-group">
          <div class="mw-field-label">计划执行时间</div>
          <input type="date" class="mw-plan-input" value="${p.plan_time || ''}" onchange="updateNextWeekPlan(${idx}, 'plan_time', this.value)">
        </div>
        <div class="mw-field-group">
          <div class="mw-field-label">工作目标</div>
          <input type="text" class="mw-plan-input" value="${p.plan_goal || ''}" placeholder="工作目标" onchange="updateNextWeekPlan(${idx}, 'plan_goal', this.value)">
        </div>
      </div>
    `).join('');
    return;
  }

  if (workReportState.nextWeekPlans.length === 0) {
    container.innerHTML = `<div class="wr-empty text-center text-muted py-24">暂无计划，点击上方按钮新增</div>`;
    return;
  }

  container.innerHTML = `
    <div class="wr-table-header wr-nextplan-row">
      <div class="wr-row-index" style="background:#6b7280">#</div>
      <div class="wr-nextplan-body">
        <span class="wr-header-cell wr-np-todo">工作事项</span>
        <span class="wr-header-cell wr-np-time">计划执行时间</span>
        <span class="wr-header-cell wr-np-goal">工作目标</span>
        <span class="wr-header-cell"></span>
      </div>
    </div>
  ` + workReportState.nextWeekPlans.map((p, idx) => `
    <div class="wr-nextplan-row">
      <div class="wr-row-index">${idx + 1}</div>
      <div class="wr-nextplan-body">
        <input type="text" class="form-input wr-np wr-np-todo" value="${p.content || ''}" placeholder="工作事项" onchange="updateNextWeekPlan(${idx}, 'content', this.value)">
        <input type="date" class="form-input wr-np wr-np-time" value="${p.plan_time || ''}" onchange="updateNextWeekPlan(${idx}, 'plan_time', this.value)">
        <input type="text" class="form-input wr-np wr-np-goal" value="${p.plan_goal || ''}" placeholder="工作目标" onchange="updateNextWeekPlan(${idx}, 'plan_goal', this.value)">
        <button class="btn-link text-danger" onclick="removeNextWeekPlan(${idx})">删除</button>
      </div>
    </div>
  `).join('');
}

// 更新下周计划
function updateNextWeekPlan(idx, field, value) {
  if (workReportState.nextWeekPlans[idx]) {
    workReportState.nextWeekPlans[idx][field] = value;
  }
}

// 新增下周计划
function addNextWeekPlanRow() {
  workReportState.nextWeekPlans.push({
    item_type: '下周计划',
    content: '',
    plan_time: '',
    plan_goal: '',
    sort_order: workReportState.nextWeekPlans.length
  });
  renderNextWeekPlansSection();
}

// 删除下周计划
function removeNextWeekPlan(idx) {
  workReportState.nextWeekPlans.splice(idx, 1);
  renderNextWeekPlansSection();
}

// 收集表单数据，组装 items
function collectWorkReportData() {
  const items = [];

  // 工作记录
  workReportState.workRecords.forEach((r, i) => {
    items.push({
      item_type: '工作记录',
      item_date: r.item_date || null,
      school_name: r.school_name || null,
      content: r.content || null,
      next_plan: r.next_plan || null,
      plan_status: null,
      plan_result: null,
      plan_time: null,
      plan_goal: null,
      sort_order: i
    });
  });

  // 下周计划
  workReportState.nextWeekPlans.forEach((p, i) => {
    items.push({
      item_type: '下周计划',
      item_date: null,
      school_name: null,
      content: p.content || null,
      next_plan: null,
      plan_status: null,
      plan_result: null,
      plan_time: p.plan_time || null,
      plan_goal: p.plan_goal || null,
      sort_order: i
    });
  });

  // 从 input 读取本周完成值
  const doneFollowEl = document.getElementById('wrDoneFollow');
  const doneNewSchoolEl = document.getElementById('wrDoneNewSchool');
  const doneSignedEl = document.getElementById('wrDoneSigned');

  const followCount = doneFollowEl ? parseInt(doneFollowEl.value) || 0 : workReportState.workRecords.length;
  const newSchoolCount = doneNewSchoolEl ? parseInt(doneNewSchoolEl.value) || 0 : 0;
  const signedSchoolCount = doneSignedEl ? parseInt(doneSignedEl.value) || 0 : 0;

  // 读取本月累计值
  const cumulativeFollowEl = document.getElementById('wrCumulativeFollow');
  const cumulativeNewSchoolEl = document.getElementById('wrCumulativeNewSchool');
  const cumulativeSignedEl = document.getElementById('wrCumulativeSigned');

  return {
    followCount,
    newSchoolCount,
    signedSchoolCount,
    cumulativeFollow: workReportState.cumulativeFollow,
    cumulativeNewSchool: workReportState.cumulativeNewSchool,
    cumulativeSigned: workReportState.cumulativeSigned,
    notes: workReportState.notes,
    items
  };
}

// 保存草稿
async function saveWorkReportDraft() {
  if (!workReportState.reportId) {
    showToast('汇报记录不存在', 'error');
    return;
  }

  try {
    const data = collectWorkReportData();
    const res = await API.updateWorkReport(workReportState.reportId, data);
    if (res.success) {
      showToast('草稿已保存', 'success');
    } else {
      showToast(res.message || '保存失败', 'error');
    }
  } catch (err) {
    console.error('saveWorkReportDraft error:', err);
    showToast('保存失败', 'error');
  }
}

// 提交汇报前二次确认
function submitWorkReportConfirm() {
  openModal('submitReportConfirmModal');
}

// 实际执行提交
async function doSubmitWorkReport() {
  if (!workReportState.reportId) {
    showToast('汇报记录不存在', 'error');
    return;
  }

  // 校验：本周实际工作情况至少1条有效记录
  const validRecords = workReportState.workRecords.filter(r => r.content && r.content.trim() !== '');
  if (validRecords.length === 0) {
    showToast('请填写本周实际工作情况', 'error');
    return;
  }

  // 校验：下周工作计划至少1条，且所有字段（工作事项、计划执行时间、工作目标）都不为空
  const validPlans = workReportState.nextWeekPlans.filter(p =>
    p.content && p.content.trim() !== '' &&
    p.plan_time && p.plan_time.trim() !== '' &&
    p.plan_goal && p.plan_goal.trim() !== ''
  );
  if (validPlans.length === 0) {
    showToast('请完整填写下周工作计划', 'error');
    return;
  }

  try {
    closeModal('submitReportConfirmModal');

    // 先保存最新数据
    const data = collectWorkReportData();

    const res = await API.submitWorkReport(workReportState.reportId, data);
    if (res.success) {
      showToast('汇报提交成功', 'success');
      // 返回列表并刷新
      showView('workReportsList', document.querySelector('[data-view=workReportsList]'));
      renderWorkReportsList();
    } else {
      showToast(res.message || '提交失败', 'error');
    }
  } catch (err) {
    console.error('doSubmitWorkReport error:', err);
    showToast('提交失败', 'error');
  }
}

// ==================== 工作管理标签页切换 ====================

function switchWorkManagementTab(element, tabId) {
  // 更新 tab 按钮状态
  const tabBar = document.getElementById('workManagementTabBar');
  if (tabBar) {
    tabBar.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
  }
  if (element) element.classList.add('active');

  // 切换内容区域显示
  const tabContents = document.querySelectorAll('.work-mgmt-tab-content');
  tabContents.forEach(content => content.style.display = 'none');

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = 'block';

  // 切换到目标设置标签时渲染表格
  if (tabId === 'workMgmtTab-goals') {
    renderMonthlyGoals();
  }
}

// ==================== 月度目标相关函数 ====================

let monthlyGoalEditId = null;
let monthlyGoalTargetUserId = null;

async function renderMonthlyGoals() {
  const tbody = document.getElementById('monthlyGoals-tbody');
  if (!tbody) return;

  // 移动端：渲染本月目标与历史目标
  if (isMobileView()) renderMobileGoals();

  try {
    const res = await API.getMonthlyGoals();
    if (!res.success) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">加载失败</td></tr>';
      return;
    }

    const goals = res.data || [];
    if (goals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-24">暂无月度目标设置</td></tr>';
      return;
    }

    const isManager = currentUser.role === '超级管理员' || currentUser.role === '一级部门负责人';

    // 临时存储供编辑按钮使用
    window._monthlyGoalsData = goals;

    tbody.innerHTML = goals.map(goal => {
      const hasGoal = goal.visit_goal || goal.new_school_goal || goal.signed_amount_goal;
      const statusText = hasGoal ? '已设置' : '未设置';
      const statusClass = hasGoal ? 'badge badge-green' : 'badge badge-gray';

      let editButton;
      if (isManager) {
        // 一级部门负责人和超级管理员：可以编辑
        editButton = `<button class="btn-link" onclick="editGoalById(${goal.id}); return false;">编辑</button>`;
      } else {
        // 销售：不可编辑
        editButton = `<button class="btn-link" onclick="showToast('目标已提交，如需修改请联系管理员', 'warning'); return false;">编辑</button>`;
      }

      return `
        <tr>
          <td>${goal.user_name || ''}</td>
          <td>${goal.month}</td>
          <td>${goal.visit_goal || '-'}</td>
          <td>${goal.new_school_goal || '-'}</td>
          <td>${goal.signed_amount_goal ? Number(goal.signed_amount_goal).toLocaleString() : '-'}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>${editButton}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('renderMonthlyGoals error:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">加载失败</td></tr>';
  }
}

function editGoalById(goalId) {
  const goal = (window._monthlyGoalsData || []).find(g => g.id === goalId);
  if (goal) {
    openMonthlyGoalModal(null, goal);
  }
}

function openMonthlyGoalModal(month, goal) {
  // 重置表单
  monthlyGoalEditId = null;
  monthlyGoalTargetUserId = null;
  document.getElementById('monthlyGoalVisit').value = '';
  document.getElementById('monthlyGoalNewSchool').value = '';
  document.getElementById('monthlyGoalSignedAmount').value = '';

  if (goal) {
    // 直接编辑模式：传入目标对象，用于编辑他人目标
    document.getElementById('monthlyGoalModalTitle').textContent = '编辑月度目标';
    document.getElementById('monthlyGoalMonth').value = goal.month;
    document.getElementById('monthlyGoalMonth').disabled = true;
    monthlyGoalEditId = goal.id;
    monthlyGoalTargetUserId = goal.user_id;
    document.getElementById('monthlyGoalVisit').value = goal.visit_goal || '';
    document.getElementById('monthlyGoalNewSchool').value = goal.new_school_goal || '';
    document.getElementById('monthlyGoalSignedAmount').value = goal.signed_amount_goal || '';
  } else if (month) {
    // 编辑模式：回显已有数据
    document.getElementById('monthlyGoalModalTitle').textContent = '编辑月度目标';
    document.getElementById('monthlyGoalMonth').value = month;
    document.getElementById('monthlyGoalMonth').disabled = true;

    // 加载已有目标数据
    API.getMonthlyGoal(month).then(res => {
      if (res && res.success && res.data) {
        monthlyGoalEditId = res.data.id;
        document.getElementById('monthlyGoalVisit').value = res.data.visit_goal || '';
        document.getElementById('monthlyGoalNewSchool').value = res.data.new_school_goal || '';
        document.getElementById('monthlyGoalSignedAmount').value = res.data.signed_amount_goal || '';
      }
    }).catch(err => {
      console.error('load monthly goal error:', err);
    });
  } else {
    // 新建模式：默认当月
    document.getElementById('monthlyGoalModalTitle').textContent = '设置月度目标';
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthlyGoalMonth').value = defaultMonth;
    document.getElementById('monthlyGoalMonth').disabled = false;
  }

  openModal('monthlyGoalModal');
}

async function submitMonthlyGoal() {
  const month = document.getElementById('monthlyGoalMonth').value;
  const visit = document.getElementById('monthlyGoalVisit').value;
  const newSchool = document.getElementById('monthlyGoalNewSchool').value;
  const signedAmount = document.getElementById('monthlyGoalSignedAmount').value;

  // 简单校验
  if (!month) {
    showToast('请选择月份', 'error');
    return;
  }
  if (!visit || Number(visit) < 0) {
    showToast('请输入有效的拜访次数目标', 'error');
    return;
  }
  if (!newSchool || Number(newSchool) < 0) {
    showToast('请输入有效的签约学校数目标', 'error');
    return;
  }
  if (!signedAmount || Number(signedAmount) < 0) {
    showToast('请输入有效的销售金额目标', 'error');
    return;
  }

  try {
    const body = {
      month: month,
      isEdit: !!monthlyGoalEditId,
      id: monthlyGoalEditId,
      target_user_id: monthlyGoalTargetUserId,
      visit_goal: Number(visit),
      new_school_goal: Number(newSchool),
      signed_amount_goal: Number(signedAmount),
    };

    const res = await API.saveMonthlyGoal(body);
    if (res.success) {
      showToast('月度目标保存成功', 'success');
      closeModal('monthlyGoalModal');
      renderMonthlyGoals();
    } else {
      showToast(res.message || '保存失败', 'error');
    }
  } catch (err) {
    console.error('submitMonthlyGoal error:', err);
    showToast('保存失败', 'error');
  }
}

// ========== 运营人员配置相关函数 ==========

/**
 * 根据姓名生成稳定的头像颜色（基于简单哈希）
 */
function getNameColor(name) {
  const colors = [
    { bg: '#dbeafe', text: '#1d4ed8' },  /* 蓝 */
    { bg: '#dcfce7', text: '#15803d' },  /* 绿 */
    { bg: '#fef3c7', text: '#b45309' },  /* 黄 */
    { bg: '#fce7f3', text: '#be185d' },  /* 粉 */
    { bg: '#e0e7ff', text: '#4338ca' },  /* 紫 */
    { bg: '#ccfbf1', text: '#0f766e' },  /* 青 */
    { bg: '#fee2e2', text: '#b91c1c' },  /* 红 */
    { bg: '#f3e8ff', text: '#7e22ce' },  /* 紫红 */
    { bg: '#fef9c3', text: '#a16207' },  /* 亮黄 */
    { bg: '#e0f2fe', text: '#0369a1' },  /* 天蓝 */
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * 渲染单个人员标签：头像 + 姓名
 */
function renderPersonTag(name) {
  const color = getNameColor(name);
  const initial = name.charAt(0);
  return `<span class="person-tag" title="${name}">
    <span class="person-avatar" style="color:${color.text};background:#fff;border:1.5px solid ${color.text};">${initial}</span>
    <span class="person-name">${name}</span>
  </span>`;
}

/**
 * 渲染人员标签列表
 * @param {string|string[]} people - 单个姓名、"、"分隔的多人名、或字符串数组
 * @returns {string} HTML 字符串
 */
function renderPersonTags(people) {
  let names = [];
  if (Array.isArray(people)) {
    names = people.filter(Boolean);
  } else if (typeof people === 'string' && people && people !== '-') {
    names = people.split('、').filter(Boolean);
  }
  if (names.length === 0) return '<span class="text-muted">-</span>';

  const shown = names.slice(0, 2);
  let html = shown.map(n => renderPersonTag(n)).join('');
  if (names.length > 2) {
    html += `<span class="person-more" title="${names.slice(2).join('、')}">+${names.length - 2}</span>`;
  }
  return `<div class="person-tags">${html}</div>`;
}

/**
 * 根据 school 对象解析运营人员姓名
 * 优先使用 operator_ids (JSON数组)，回退到 operator_name
 */
function getOperatorNames(school) {
  // 尝试解析 operator_ids (JSON 字符串或数组)
  let ids = null;
  if (school.operator_ids) {
    try {
      ids = typeof school.operator_ids === 'string' ? JSON.parse(school.operator_ids) : school.operator_ids;
    } catch (e) {
      ids = null;
    }
  }
  if (ids && Array.isArray(ids) && ids.length > 0) {
    return ids.map(id => {
      const user = usersData.find(u => u.id === id);
      return user ? user.name : null;
    }).filter(Boolean).join('、') || '-';
  }
  // 回退到 operator_name
  return school.operator_name || school.operator || '-';
}

/**
 * 打开运营人员配置弹窗
 */
function openOperatorConfigModal() {
  if (!currentSchoolId) {
    showToast('请先选择一个学校', 'warning');
    return;
  }

  // 打开弹窗
  openModal('operatorConfigModal');

  // 获取当前已配置的运营人员 IDs
  let currentIds = [];
  if (schoolDetail && schoolDetail.operator_ids) {
    try {
      currentIds = typeof schoolDetail.operator_ids === 'string'
        ? JSON.parse(schoolDetail.operator_ids)
        : schoolDetail.operator_ids;
      if (!Array.isArray(currentIds)) currentIds = [];
    } catch (e) {
      currentIds = [];
    }
  }

  // 渲染运营人员选择列表
  renderOperatorConfig(currentIds);
}

/**
 * 渲染运营人员配置列表
 * @param {number[]} selectedIds - 已选中的运营人员ID数组
 */
function renderOperatorConfig(selectedIds) {
  const container = document.getElementById('operatorConfigList');
  if (!container) return;

  // 仅超管可选全部，其他所有角色都只选本部门
  const isUnrestricted = currentUser.role === '超级管理员';

  // 筛选员工角色用户
  let employees = usersData.filter(u => u.role === '员工' && u.status !== 0);

  // 非超管：只选本部门
  if (!isUnrestricted && currentUser.dept) {
    employees = employees.filter(u => u.dept === currentUser.dept);
  }

  if (employees.length === 0) {
    container.innerHTML = `<div class="empty-state-inline">${isUnrestricted ? '暂无可配置的员工' : '当前部门暂无可配置的员工'}</div>`;
    return;
  }

  container.innerHTML = employees.map(user => {
    const checked = selectedIds.includes(user.id);
    return `
      <label class="operator-option" style="display: flex; align-items: center; padding: 10px 12px; border: 1px solid ${checked ? 'var(--brand, #1f85ff)' : '#e5e7eb'}; border-radius: 8px; margin-bottom: 8px; cursor: pointer; background: ${checked ? 'rgba(31,133,255,0.05)' : '#fff'}; transition: all 0.2s;">
        <input type="checkbox" name="operatorConfig" value="${user.id}" ${checked ? 'checked' : ''} style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;" onchange="this.parentElement.style.borderColor = this.checked ? 'var(--brand, #1f85ff)' : '#e5e7eb'; this.parentElement.style.background = this.checked ? 'rgba(31,133,255,0.05)' : '#fff'">
        <span style="font-weight: 500; color: var(--text, #1f2937);">${user.name}</span>
        ${user.dept ? `<span style="margin-left: 8px; font-size: 12px; color: #9ca3af;">${user.dept}</span>` : ''}
      </label>
    `;
  }).join('');
}

/**
 * 保存运营人员配置
 */
async function saveOperatorConfig() {
  if (!currentSchoolId) {
    showToast('请先选择一个学校', 'warning');
    return;
  }

  // 收集选中的运营人员ID
  const checkboxes = document.querySelectorAll('input[name="operatorConfig"]:checked');
  const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (selectedIds.length === 0) {
    showToast('请至少选择一名运营人员', 'warning');
    return;
  }

  try {
    // 调用更新API
    const res = await API.updateSchool(currentSchoolId, {
      operatorIds: selectedIds,
    });

    if (res.success) {
      showToast('运营人员配置已保存', 'success');

      // 更新本地数据
      if (schoolDetail) {
        schoolDetail.operator_ids = JSON.stringify(selectedIds);
      }

      // 更新显示
      const detailOperator = document.getElementById('detailOperator');
      if (detailOperator) {
        const names = selectedIds.map(id => {
          const user = usersData.find(u => u.id === id);
          return user ? user.name : null;
        }).filter(Boolean);
        detailOperator.textContent = names.join('、') || '-';
      }

      // 关闭弹窗
      closeModal('operatorConfigModal');
    } else {
      showToast(res.message || '保存失败', 'error');
    }
  } catch (err) {
    console.error('saveOperatorConfig error:', err);
    showToast('保存失败', 'error');
  }
}

/* ==================== 移动端 JS 功能 ==================== */

function isMobile() {
  return window.innerWidth <= 768;
}

// 抽屉侧边栏
function openMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// FAB 悬浮按钮
function toggleFabMenu() {
  const menu = document.getElementById('fabMenu');
  const btn = document.getElementById('fabButton');
  if (menu) menu.classList.toggle('show');
  if (btn && menu && menu.classList.contains('show')) {
    btn.style.display = 'none';
  } else if (btn) {
    btn.style.display = 'flex';
  }
}

function closeFabMenu() {
  const menu = document.getElementById('fabMenu');
  const btn = document.getElementById('fabButton');
  if (menu) menu.classList.remove('show');
  if (btn) btn.style.display = 'flex';
}

// 学校详情页返回学校列表
function goBackToSchoolList() {
  const schoolNav = document.querySelector('[data-view="schoolList"]');
  showView('schoolList', schoolNav);
}

// 更新移动端用户信息
function updateMobileUserInfo() {
  if (!currentUser) return;
  const avatar = document.querySelector('.mobile-drawer-footer .avatar');
  const nameEl = document.querySelector('.mobile-drawer-footer .user-name');
  const roleEl = document.querySelector('.mobile-drawer-footer .user-role');
  if (avatar) avatar.textContent = (currentUser.name || '?').charAt(0);
  if (nameEl) nameEl.textContent = currentUser.name || '-';
  if (roleEl) roleEl.textContent = currentUser.role || '-';
}

// 移动端初始化
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (overlay) {
      overlay.addEventListener('click', closeMobileDrawer);
    }
    document.addEventListener('click', function(e) {
      const fab = document.getElementById('fabButton');
      const menu = document.getElementById('fabMenu');
      if (fab && menu && !fab.contains(e.target) && !menu.contains(e.target)) {
        closeFabMenu();
      }
    });
    updateMobileUserInfo();
  });

  let lastMobileState = isMobile();
  window.addEventListener('resize', function() {
    const mobile = isMobile();
    if (mobile !== lastMobileState) {
      lastMobileState = mobile;
      if (!mobile) {
        closeMobileDrawer();
        closeFabMenu();
      }
    }
  });
})();
