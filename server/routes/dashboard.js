const express = require('express');
const { query, queryOne } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// GET /api/dashboard/employee - 统一工作台数据
router.get('/employee', async (req, res) => {
  try {
    const user_id = req.user.id;
    const role = req.user.role;
    const dept = req.user.dept;

    // 月目标在 targetProgress 中从 monthly_goals 表获取，这里不需要单独查询

    // 根据角色确定学校范围（销售 OR 运营，合并去重）
    let schoolWhere = '';
    const schoolParams = [];
    if (role === '员工' || role === '销售') {
      schoolWhere = '(sales_id = ? OR operator_id = ?)';
      schoolParams.push(user_id, user_id);
    } else if (role === '一级部门负责人' && dept) {
      schoolWhere = '1=1';
    } else {
      schoolWhere = '1=1';
    }

    // 辅助函数：安全获取 queryOne 的 count，避免 null
    const safeCount = (row) => (row && row.count != null ? row.count : 0);

    // 学校统计（去重：同一学校既当销售又当运营只计1所）
    const totalSchools = safeCount(await queryOne(`SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere}`, schoolParams));
    let opsCount;
    if (role === '员工' || role === '销售') {
      opsCount = safeCount(await queryOne(`SELECT COUNT(*) as count FROM schools WHERE operator_id = ?`, [user_id]));
    } else if (role === '一级部门负责人' && dept) {
      opsCount = safeCount(await queryOne(`SELECT COUNT(DISTINCT s.id) as count FROM schools s INNER JOIN users u ON s.operator_id = u.id WHERE u.dept = ?`, [dept]));
    } else {
      opsCount = safeCount(await queryOne(`SELECT COUNT(*) as count FROM schools WHERE operator_id IS NOT NULL AND operator_id != 0`));
    }
    const intendingCount = safeCount(await queryOne(`SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere} AND status = '有意向'`, schoolParams));
    const discussingCount = safeCount(await queryOne(`SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere} AND status = '方案沟通'`, schoolParams));

    // 本月已签约（通过 contracts.sign_date 判断）
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`;
    const monthSigned = safeCount(await queryOne(
      `SELECT COUNT(DISTINCT s.id) as count FROM schools s
       INNER JOIN contracts c ON s.id = c.school_id
       WHERE ${schoolWhere} AND c.sign_date >= ? AND c.sign_date < ?`,
      [...schoolParams, monthStart, monthEnd]
    ));

    // 最近工作记录
    let recordsWhere = '';
    const recordsParams = [];
    if (role === '员工' || role === '销售') {
      recordsWhere = 'fr.user_id = ?';
      recordsParams.push(user_id);
    } else if (role === '一级部门负责人' && dept) {
      recordsWhere = 'u.dept = ?';
      recordsParams.push(dept);
    } else {
      recordsWhere = '1=1';
    }

    let recentRecords;
    if (role === '一级部门负责人' && dept) {
      recentRecords = await query(
        `SELECT fr.*, s.name as school_name FROM follow_records fr
         INNER JOIN schools s ON fr.school_id = s.id
         INNER JOIN users u ON fr.user_id = u.id
         WHERE ${recordsWhere}
         ORDER BY fr.created_at DESC LIMIT 5`,
        recordsParams
      );
    } else {
      recentRecords = await query(
        `SELECT fr.*, s.name as school_name FROM follow_records fr
         INNER JOIN schools s ON fr.school_id = s.id
         WHERE ${recordsWhere}
         ORDER BY fr.created_at DESC LIMIT 5`,
        recordsParams
      );
    }

    // 超期预警（超过15天没有工作记录的学校）
    let overdueWhere = '';
    const overdueParams = [];
    if (role === '员工' || role === '销售') {
      overdueWhere = '(s.sales_id = ? OR s.operator_id = ?)';
      overdueParams.push(user_id, user_id);
    } else if (role === '一级部门负责人' && dept) {
      overdueWhere = '1=1';
    } else {
      overdueWhere = '1=1';
    }

    const overdueWarnings = await query(
      `SELECT s.*,
              MAX(fr.created_at) as last_work_date,
              CAST(julianday('now') - julianday(MAX(fr.created_at)) AS INTEGER) as overdue_days,
              CASE
                WHEN julianday('now') - julianday(MAX(fr.created_at)) > 15 THEN '严重'
                ELSE '注意'
              END as level
       FROM schools s
       LEFT JOIN follow_records fr ON s.id = fr.school_id
       WHERE ${overdueWhere} AND s.status NOT IN ('已签约', '运营中', '已到期')
       GROUP BY s.id
       HAVING julianday('now') - julianday(MAX(fr.created_at)) > 10
       ORDER BY overdue_days DESC
       LIMIT 5`,
      overdueParams
    );

    // 超期预警总数
    const overdueCount = safeCount(await queryOne(
      `SELECT COUNT(*) as count FROM (
       SELECT s.id
       FROM schools s
       LEFT JOIN follow_records fr ON s.id = fr.school_id
       WHERE ${overdueWhere} AND s.status NOT IN ('已签约', '运营中', '已到期')
       GROUP BY s.id
       HAVING julianday('now') - julianday(MAX(fr.created_at)) > 10
      )`,
      overdueParams
    ));

    // 本周工作统计
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    let weekWhere = '';
    const weekParams = [];
    if (role === '员工' || role === '销售') {
      weekWhere = 'fr.user_id = ?';
      weekParams.push(user_id);
    } else if (role === '一级部门负责人' && dept) {
      weekWhere = 'u.dept = ?';
      weekParams.push(dept);
    } else {
      weekWhere = '1=1';
    }

    let weekRecords;
    if (role === '一级部门负责人' && dept) {
      weekRecords = safeCount(await queryOne(
        `SELECT COUNT(*) as count FROM follow_records fr
         INNER JOIN users u ON fr.user_id = u.id
         WHERE ${weekWhere} AND fr.created_at >= ?`,
        [...weekParams, weekStartStr]
      ));
    } else {
      weekRecords = safeCount(await queryOne(
        `SELECT COUNT(*) as count FROM follow_records fr
         WHERE ${weekWhere} AND fr.created_at >= ?`,
        [...weekParams, weekStartStr]
      ));
    }

    // 目标进度数据（从 monthly_goals 取目标量，从 work_reports 取完成量）
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthGoal = await queryOne(
      'SELECT * FROM monthly_goals WHERE user_id = ? AND month = ?',
      [user_id, currentMonth]
    );

    // 当月已提交的汇报累计
    // work_reports.period 格式为 "2026年11月第2周"，需匹配 "2026年11月%"
    const periodPrefix = currentMonth.replace('-', '年') + '月';
    const monthReportSum = await queryOne(
      `SELECT COALESCE(SUM(follow_count), 0) as total_follow,
              COALESCE(SUM(new_school_count), 0) as total_new_school,
              COALESCE(SUM(signed_school_count), 0) as total_signed_school
       FROM work_reports WHERE user_id = ? AND period LIKE ? || '%' AND status = '已提交'`,
      [user_id, periodPrefix]
    );
    console.log(`[目标进度调试] user_id=${user_id}, currentMonth=${currentMonth}, periodPrefix=${periodPrefix}, monthGoal=${JSON.stringify(monthGoal)}, monthReportSum=${JSON.stringify(monthReportSum)}`);

    const targetProgress = monthGoal ? {
      hasGoal: true,
      month: currentMonth,
      goalId: monthGoal.id,
      visitGoal: monthGoal.visit_goal || 0,
      visitCompleted: monthReportSum.total_follow,
      newSchoolGoal: monthGoal.new_school_goal || 0,
      newSchoolCompleted: monthReportSum.total_new_school,
      signedAmountGoal: monthGoal.signed_amount_goal || 0,
      signedAmountCompleted: monthReportSum.total_signed_school,
      indicators: [
        { key: 'visit', name: '拜访次数', unit: '次', color: '#2563eb', completed: monthReportSum.total_follow, goal: monthGoal.visit_goal || 0 },
        { key: 'new_school', name: '签约学校数', unit: '所', color: '#059669', completed: monthReportSum.total_new_school, goal: monthGoal.new_school_goal || 0 },
        { key: 'signed_amount', name: '销售目标', unit: '元', color: '#b45309', completed: monthReportSum.total_signed_school, goal: monthGoal.signed_amount_goal || 0 },
      ],
    } : { hasGoal: false, month: currentMonth };

    res.json({
      success: true,
      data: {
        stats: {
          totalSchools,
          opsCount,
          monthSigned,
          intendingCount,
          discussingCount,
          negotiating: (intendingCount + discussingCount),
          overdueCount,
          monthlyTarget: targetProgress.newSchoolGoal || 0,
        },
        recentRecords,
        overdueWarnings,
        weekStats: {
          thisWeekRecords: weekRecords,
        },
        targetProgress,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/week-plan - 本周工作计划（取上周提交周报中的"下周计划"）
router.get('/week-plan', async (req, res) => {
  try {
    const { id: userId, role, dept } = req.user;

    // 计算上周一 ~ 上周日
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(today.getTime() - mondayOffset * 86400000);
    const lastMonday = new Date(thisMonday.getTime() - 7 * 86400000);
    const lastSunday = new Date(thisMonday.getTime() - 86400000);
    const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let userWhere = '';
    const params = [fmtDate(lastMonday), fmtDate(lastSunday)];
    if (role === '员工' || role === '销售') {
      userWhere = 'AND wr.user_id = ?';
      params.push(userId);
    } else if (role === '一级部门负责人' && dept) {
      userWhere = 'AND u.dept = ?';
      params.push(dept);
    }

    const plans = await query(
      `SELECT i.plan_time, i.content, i.plan_goal
       FROM work_reports wr
       INNER JOIN work_report_items i ON i.report_id = wr.id
       LEFT JOIN users u ON wr.user_id = u.id
       WHERE wr.report_type = '周度汇报'
         AND wr.status = '已提交'
         AND i.item_type = '下周计划'
         AND date(COALESCE(wr.submitted_at, wr.created_at)) BETWEEN ? AND ?
         ${userWhere}
       ORDER BY i.plan_time ASC, i.sort_order ASC`,
      params
    );

    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

