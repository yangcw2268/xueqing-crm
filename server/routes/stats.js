const express = require('express');
const { query, queryOne } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// GET /api/stats/employee - 统一统计
router.get('/employee', async (req, res) => {
  try {
    const user_id = req.user.id;
    const role = req.user.role;
    const dept = req.user.dept;

    // 根据角色确定学校范围
    let schoolWhere = '';
    const schoolParams = [];
    if (role === '员工') {
      schoolWhere = 'sales_id = ?';
      schoolParams.push(user_id);
    } else if (role === '一级部门负责人' && dept) {
      schoolWhere = '1=1';
    } else {
      schoolWhere = '1=1';
    }

    // 我负责的学校数
    const totalSchools = await queryOne(`SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere}`, schoolParams);

    // 本月已签约数
    const monthSigned = await queryOne(
      `SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere} AND status = '已签约' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`,
      schoolParams
    );

    // 在谈学校数
    const negotiating = await queryOne(
      `SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere} AND status = '方案沟通'`,
      schoolParams
    );

    // 超期预警列表（超过30天没有工作记录的学校）
    let overdueWhere = '';
    const overdueParams = [];
    if (role === '员工') {
      overdueWhere = 's.sales_id = ?';
      overdueParams.push(user_id);
    } else if (role === '一级部门负责人' && dept) {
      overdueWhere = '1=1';
    } else {
      overdueWhere = '1=1';
    }

    const overdueWarnings = await query(
      `SELECT s.*, MAX(fr.created_at) as last_work_date
       FROM schools s
       LEFT JOIN follow_records fr ON s.id = fr.school_id
       WHERE ${overdueWhere} AND s.status NOT IN ('已签约', '运营中', '已到期')
       GROUP BY s.id
       HAVING julianday('now') - julianday(MAX(fr.created_at)) > 10
       LIMIT 10`,
      overdueParams
    );

    // 本月目标进度
    const monthGoal = await queryOne(
      `SELECT COUNT(*) as count FROM schools WHERE ${schoolWhere} AND status = '已签约'`,
      schoolParams
    );
    const monthTarget = 10; // 默认月度目标
    const progress = Math.min(Math.round((monthGoal.count / monthTarget) * 100), 100);

    // 最近工作动态
    let recordsWhere = '';
    const recordsParams = [];
    if (role === '员工') {
      recordsWhere = 'wr.user_id = ?';
      recordsParams.push(user_id);
    } else if (role === '一级部门负责人' && dept) {
      recordsWhere = 'u.dept = ?';
      recordsParams.push(dept);
    } else {
      recordsWhere = '1=1';
    }

    const recentActivities = await query(
      `SELECT fr.*, s.name as school_name, u.name as user_name
       FROM follow_records fr
       INNER JOIN schools s ON fr.school_id = s.id
       INNER JOIN users u ON fr.user_id = u.id
       WHERE ${recordsWhere}
       ORDER BY fr.created_at DESC
       LIMIT 5`,
      recordsParams
    );

    res.json({
      success: true,
      data: {
        mySchools: totalSchools.count,
        monthSigned: monthSigned.count,
        negotiating: negotiating.count,
        overdueWarnings,
        monthTarget: monthTarget,
        monthSignedActual: monthGoal.count,
        monthProgress: progress,
        recentActivities,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
