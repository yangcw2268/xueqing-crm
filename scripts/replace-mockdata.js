const fs = require('fs');

const path = './js/app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace mockData object with global variables
const mockDataStart = content.indexOf('// ========== Mock Data');
const mockDataEnd = content.indexOf('// ========== 当前用户', mockDataStart);
const beforeMockData = content.substring(0, mockDataStart);
const afterMockData = content.substring(mockDataEnd);

const globalVars = `// ========== 全局数据变量 ==========
let schoolsData = [];
let recordsData = [];
let usersData = [];
let schoolDictData = [];
let nextSchoolDictId = 1;
let schoolDetail = null;
let handoverListData = [];

// ========== API 数据加载 ==========
async function loadData() {
  try {
    const [schoolsRes, recordsRes, usersRes, schoolDictRes] = await Promise.all([
      API.getSchools(),
      API.getRecords(),
      API.getUsers(),
      API.getSchoolDict(),
    ]);

    if (schoolsRes && schoolsRes.code === 200) {
      schoolsData = schoolsRes.data || [];
    }
    if (recordsRes && recordsRes.code === 200) {
      recordsData = recordsRes.data || [];
    }
    if (usersRes && usersRes.code === 200) {
      usersData = usersRes.data || [];
    }
    if (schoolDictRes && schoolDictRes.code === 200) {
      schoolDictData = schoolDictRes.data || [];
      // 计算下一个ID
      const maxId = schoolDictData.reduce((max, s) => Math.max(max, s.id || 0), 0);
      nextSchoolDictId = maxId + 1;
    }
  } catch (e) {
    console.error('加载数据失败:', e);
  }
}

async function loadSchoolDetail(schoolId) {
  try {
    const res = await API.getSchool(schoolId);
    if (res && res.code === 200) {
      schoolDetail = res.data;
      renderStatusFlow();
      updateFlowButtonsVisibility();
      updateHandoverButtonVisibility();
    }
  } catch (e) {
    console.error('加载学校详情失败:', e);
  }
}

// ==========`;

content = beforeMockData + globalVars + afterMockData;

// 2. Replace currentUser default (keep API.getUser() fallback)
content = content.replace(
  "let currentUser = API.getUser() || {\n      name: '张三',\n      dept: '华东区',\n      role: '超级管理员',\n      id: 1\n    };",
  "let currentUser = API.getUser() || {\n      name: '',\n      dept: '',\n      role: '',\n      id: 1\n    };"
);

// 3. Replace schoolDictionary array with empty array (will be loaded from API)
const dictStart = content.indexOf('let schoolDictionary = [');
if (dictStart > -1) {
  const dictEnd = content.indexOf('let nextSchoolId = ', dictStart);
  const afterDict = content.substring(dictEnd);
  content = content.substring(0, dictStart) + 'let schoolDictData = [];\n' + afterDict;
}

// 4. Replace nextSchoolId
content = content.replace(/let nextSchoolId = \d+/g, 'let nextSchoolDictId = 1;');

// 5. Global replacements (careful with order - longer patterns first)
// schoolDictionary references
content = content.replace(/schoolDictionary\.push\(/g, 'schoolDictData.push(');
content = content.replace(/schoolDictionary\.find\(/g, 'schoolDictData.find(');
content = content.replace(/schoolDictionary\.filter\(/g, 'schoolDictData.filter(');
content = content.replace(/schoolDictionary\.length/g, 'schoolDictData.length');
content = content.replace(/schoolDictionary\[0\]/g, 'schoolDictData[0]');
content = content.replace(/schoolDictionary\s*=/g, 'schoolDictData =');
content = content.replace(/schoolDictionary\s*\./g, 'schoolDictData.');

// mockData references
content = content.replace(/mockData\.schools\b/g, 'schoolsData');
content = content.replace(/mockData\.records\b/g, 'recordsData');
content = content.replace(/mockData\.schoolDetail\b/g, 'schoolDetail');
content = content.replace(/mockData\.users\b/g, 'usersData');
content = content.replace(/mockData\.handoverList\b/g, 'handoverListData');
content = content.replace(/mockData\.operationLogs\b/g, 'mockOperationLogs');
content = content.replace(/mockData\.operatorStats\b/g, 'mockOperatorStats');
content = content.replace(/mockData\.operatorWarnings\b/g, 'mockOperatorWarnings');
content = content.replace(/mockData\.dataItems\b/g, 'mockDataItems');
content = content.replace(/mockData\.salesStats\b/g, 'mockSalesStats');
content = content.replace(/mockData\.overdueWarnings\b/g, 'mockOverdueWarnings');
content = content.replace(/mockData\.monthlyTargets\b/g, 'mockMonthlyTargets');
content = content.replace(/mockData\.recentFollowUps\b/g, 'mockRecentFollowUps');

// nextSchoolId references (for batch import)
content = content.replace(/nextSchoolId\+\+/g, 'nextSchoolDictId++');
content = content.replace(/nextSchoolId\b/g, 'nextSchoolDictId');

fs.writeFileSync(path, content, 'utf8');
console.log('Replacements done');
