const express = require('express');
const { query, queryOne, run } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// ─── 周期工具函数 ───

/**
 * 获取当前周的周期标识，格式：xxxx年xx月第xx周（自然月，每月1号为第1周，周一到周日为一周）
 */
function getCurrentWeekPeriod() {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // 当前日期所在周的周一
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - mondayOffset);
  // 本月第1周的周一
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();
  const firstMondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  let firstMonday = new Date(firstDay);
  firstMonday.setDate(firstDay.getDate() - firstMondayOffset);
  if (firstMonday.getMonth() !== firstDay.getMonth()) {
    firstMonday = new Date(firstDay);
  }
  const weekNum = Math.floor((monday - firstMonday) / 86400000 / 7) + 1;
  return `${year}年${month}月第${weekNum}周`;
}

/**
 * 获取当前月的周期标识，格式 YYYY-MM (如 2024-01)
 */
function getCurrentMonthPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 根据周期类型获取当前周期
 */
function getCurrentPeriod(reportType) {
  return reportType === '月度汇报' ? getCurrentMonthPeriod() : getCurrentWeekPeriod();
}

/**
 * 根据周期获取起始和结束日期
 */
function getPeriodDateRange(period, reportType) {
  if (reportType === '月度汇报') {
    // 格式 YYYY-MM
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return {
      start: startDate.toISOString().slice(0, 19).replace('T', ' '),
      end: endDate.toISOString().slice(0, 19).replace('T', ' ')
    };
  } else if (period.includes('-W')) {
    // 旧格式 YYYY-Www
    const [yearStr, weekStr] = period.split('-W');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    const jan1 = new Date(year, 0, 1);
    const startDate = new Date(jan1.getTime() + (week - 1) * 7 * 86400000);
    const endDate = new Date(startDate.getTime() + 6 * 86400000 + 86399999);
    return {
      start: startDate.toISOString().slice(0, 19).replace('T', ' '),
      end: endDate.toISOString().slice(0, 19).replace('T', ' ')
    };
  } else {
    // 新格式：xxxx年xx月第xx周（自然月，每月1号为第1周，周一到周日）
    const yearMatch = period.match(/(\d+)年/);
    const monthMatch = period.match(/(\d+)月/);
    const weekMatch = period.match(/第(\d+)周/);
    if (!yearMatch || !monthMatch || !weekMatch) {
      return { start: '', end: '' };
    }
    const year = parseInt(yearMatch[1]);
    const month = parseInt(monthMatch[1]);
    const week = parseInt(weekMatch[1]);
    // 找本月第1周的周一
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();
    const firstMondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    let monthFirstMonday = new Date(firstDay);
    monthFirstMonday.setDate(firstDay.getDate() - firstMondayOffset);
    if (monthFirstMonday.getMonth() !== firstDay.getMonth()) {
      monthFirstMonday = new Date(year, month - 1, 1);
    }
    // 计算该周周一
    const monday = new Date(monthFirstMonday.getTime() + (week - 1) * 7 * 86400000);
    const sunday = new Date(monday.getTime() + 6 * 86400000 + 86399999);
    return {
      start: monday.toISOString().slice(0, 19).replace('T', ' '),
      end: sunday.toISOString().slice(0, 19).replace('T', ' ')
    };
  }
}

// ─── CRUD 接口 ───

// GET /api/work-reports - 获取汇报记录列表（按角色过滤）
router.get('/', async (req, res) => {
  try {
    const { id: userId, role, dept } = req.user;
    const { reportType } = req.query;

    let sql, params;

    if (role === '超级管理员') {
      // 超管：查看全公司所有汇报
      sql = `SELECT wr.*, u.name as user_name FROM work_reports wr INNER JOIN users u ON wr.user_id = u.id WHERE 1=1`;
      params = [];
    } else if (role === '一级部门负责人') {
      // 部门负责人：查看本部门所有汇报
      sql = `SELECT wr.*, u.name as user_name FROM work_reports wr INNER JOIN users u ON wr.user_id = u.id WHERE u.dept = ?`;
      params = [dept];
    } else {
      // 销售：只看自己的
      sql = `SELECT wr.*, u.name as user_name FROM work_reports wr INNER JOIN users u ON wr.user_id = u.id WHERE wr.user_id = ?`;
      params = [userId];
    }

    if (reportType) {
      sql += ' AND wr.report_type = ?';
      params.push(reportType);
    }

    sql += ' ORDER BY wr.created_at DESC';
    const reports = await query(sql, params);
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 月度目标接口（必须在 /:id 之前） ───

// GET /api/monthly-goals - 获取月度目标列表（按角色过滤）
router.get('/monthly-goals', async (req, res) => {
  try {
    const { id: userId, role, dept } = req.user;

    let sql, params;

    if (role === '超级管理员') {
      // 超管：查看全公司所有目标
      sql = `SELECT mg.*, u.name as user_name FROM monthly_goals mg INNER JOIN users u ON mg.user_id = u.id WHERE 1=1 ORDER BY mg.month DESC`;
      params = [];
    } else if (role === '一级部门负责人') {
      // 部门负责人：查看本部门所有目标
      sql = `SELECT mg.*, u.name as user_name FROM monthly_goals mg INNER JOIN users u ON mg.user_id = u.id WHERE u.dept = ? ORDER BY mg.month DESC`;
      params = [dept];
    } else {
      // 销售：只看自己的
      sql = `SELECT mg.*, u.name as user_name FROM monthly_goals mg INNER JOIN users u ON mg.user_id = u.id WHERE mg.user_id = ? ORDER BY mg.month DESC`;
      params = [userId];
    }

    const goals = await query(sql, params);
    res.json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/monthly-goals/:month - 获取指定月份的目标（支持跨用户查询）
router.get('/monthly-goals/:month', async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { month } = req.params;
    const { user_id } = req.query;

    // 确定目标用户ID：跨用户查询时使用 query 参数 user_id
    const targetUserId = user_id || userId;

    // 权限校验：超管和部门负责人可查询任意目标，销售只能查自己的
    if (role !== '超级管理员' && role !== '一级部门负责人' && targetUserId !== userId) {
      return res.status(403).json({ success: false, message: '无权查看此目标' });
    }

    const goal = await queryOne(
      'SELECT * FROM monthly_goals WHERE user_id = ? AND month = ?',
      [targetUserId, month]
    );
    res.json({ success: true, data: goal || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/monthly-goals - 创建/更新月度目标（支持跨用户操作）
router.post('/monthly-goals', async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { month, isEdit, id, target_user_id, visit_goal, new_school_goal, signed_amount_goal } = req.body;

    if (!month) {
      return res.status(400).json({ success: false, message: '月份不能为空' });
    }

    // 确定目标用户ID：跨用户操作时使用 target_user_id
    const targetUserId = target_user_id || userId;

    // 编辑模式
    if (isEdit && id) {
      const existing = await queryOne('SELECT * FROM monthly_goals WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: '目标记录不存在' });
      }
      // 超管和部门负责人可编辑任意目标，销售只能编辑自己的
      if (role !== '超级管理员' && role !== '一级部门负责人' && existing.user_id !== userId) {
        return res.status(403).json({ success: false, message: '无权编辑此目标' });
      }
      await run(
        `UPDATE monthly_goals SET visit_goal = ?, new_school_goal = ?, signed_amount_goal = ?, updated_at = datetime('now') WHERE id = ?`,
        [visit_goal || 0, new_school_goal || 0, signed_amount_goal || 0, id]
      );
      const updated = await queryOne('SELECT * FROM monthly_goals WHERE id = ?', [id]);
      return res.json({ success: true, data: updated });
    }

    // 新增模式：检查是否已存在
    const existing = await queryOne(
      'SELECT * FROM monthly_goals WHERE user_id = ? AND month = ?',
      [targetUserId, month]
    );
    if (existing) {
      return res.status(400).json({ success: false, message: '该月份目标已存在，请勿重复设置' });
    }

    // 创建
    const result = await run(
      `INSERT INTO monthly_goals (user_id, month, visit_goal, new_school_goal, signed_amount_goal) VALUES (?, ?, ?, ?, ?)`,
      [targetUserId, month, visit_goal || 0, new_school_goal || 0, signed_amount_goal || 0]
    );
    const created = await queryOne('SELECT * FROM monthly_goals WHERE id = ?', [result]);
    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/monthly-goals/:month - 删除指定月份的目标（支持跨用户操作）
router.delete('/monthly-goals/:month', async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { month } = req.params;
    const { target_user_id } = req.query;

    // 确定目标用户ID：跨用户操作时使用 target_user_id
    const targetUserId = target_user_id || userId;

    // 权限校验：超管和部门负责人可删除任意目标，销售只能删除自己的
    if (role !== '超级管理员' && role !== '一级部门负责人' && targetUserId !== userId) {
      return res.status(403).json({ success: false, message: '无权删除此目标' });
    }

    await run('DELETE FROM monthly_goals WHERE user_id = ? AND month = ?', [targetUserId, month]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/work-reports/current-period - 获取当前周期信息（必须在 /:id 之前）
router.get('/current-period', async (req, res) => {
  try {
    const reportType = req.query.reportType || '周度汇报';
    const period = getCurrentPeriod(reportType);
    const dateRange = getPeriodDateRange(period, reportType);

    res.json({
      success: true,
      data: {
        period,
        reportType,
        startDate: dateRange.start.slice(0, 10),
        endDate: dateRange.end.slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/work-reports/:id - 获取汇报详情（按角色校验权限）
router.get('/:id', async (req, res) => {
  try {
    const { id: userId, role, dept } = req.user;
    const reportId = req.params.id;

    let report;
    if (role === '超级管理员') {
      report = await queryOne('SELECT * FROM work_reports WHERE id = ?', [reportId]);
    } else if (role === '一级部门负责人') {
      report = await queryOne(
        'SELECT wr.* FROM work_reports wr INNER JOIN users u ON wr.user_id = u.id WHERE wr.id = ? AND u.dept = ?',
        [reportId, dept]
      );
    } else {
      report = await queryOne(
        'SELECT * FROM work_reports WHERE id = ? AND user_id = ?',
        [reportId, userId]
      );
    }

    if (!report) {
      return res.status(404).json({ success: false, message: '汇报记录不存在' });
    }

    // 查询明细（JOIN schools 拿每所学校当前状态）
    const items = await query(
      `SELECT i.*, s.status as school_status
       FROM work_report_items i
       LEFT JOIN schools s ON s.name = i.school_name
       WHERE i.report_id = ?
       ORDER BY i.sort_order ASC, i.created_at ASC`,
      [reportId]
    );

    res.json({ success: true, data: { ...report, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/work-reports - 创建新汇报（草稿状态）
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { reportType, period, items } = req.body;

    // 检查是否已存在同类型同期的已提交记录
    const submitted = await queryOne(
      'SELECT * FROM work_reports WHERE user_id = ? AND report_type = ? AND period = ? AND status = ?',
      [userId, reportType, period, '已提交']
    );

    if (submitted) {
      return res.json({ success: true, data: { id: submitted.id, alreadySubmitted: true } });
    }

    // 检查是否已存在同类型同期的草稿
    const existing = await queryOne(
      'SELECT * FROM work_reports WHERE user_id = ? AND report_type = ? AND period = ? AND status = ?',
      [userId, reportType, period, '草稿']
    );

    if (existing) {
      return res.json({ success: true, data: { id: existing.id } });
    }

    const result = await run(
      'INSERT INTO work_reports (user_id, report_type, period, status, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [userId, reportType, period, '草稿']
    );

    const reportId = result;

    // 批量插入明细
    if (items && items.length > 0) {
      for (const item of items) {
        await run(
          `INSERT INTO work_report_items (report_id, item_type, item_date, school_name, content, next_plan, plan_status, plan_result, plan_time, plan_goal, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            item.item_type,
            item.item_date || null,
            item.school_name || null,
            item.content || null,
            item.next_plan || null,
            item.plan_status || null,
            item.plan_result || null,
            item.plan_time || null,
            item.plan_goal || null,
            item.sort_order || 0
          ]
        );
      }
    }

    res.json({ success: true, data: { id: reportId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/work-reports/:id - 保存草稿（更新汇报及明细）
router.put('/:id', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const reportId = req.params.id;
    const { followCount, newSchoolCount, signedSchoolCount, notes, items } = req.body;

    // 校验归属
    const report = await queryOne(
      'SELECT * FROM work_reports WHERE id = ? AND user_id = ?',
      [reportId, userId]
    );

    if (!report) {
      return res.status(404).json({ success: false, message: '汇报记录不存在' });
    }

    // 更新主表统计
    await run(
      'UPDATE work_reports SET follow_count = ?, new_school_count = ?, signed_school_count = ?, notes = ? WHERE id = ?',
      [followCount || 0, newSchoolCount || 0, signedSchoolCount || 0, notes || null, reportId]
    );

    // 删除旧明细
    await run('DELETE FROM work_report_items WHERE report_id = ?', [reportId]);

    // 插入新明细
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await run(
          `INSERT INTO work_report_items (report_id, item_type, item_date, school_name, content, next_plan, plan_status, plan_result, plan_time, plan_goal, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            item.item_type,
            item.item_date || null,
            item.school_name || null,
            item.content || null,
            item.next_plan || null,
            item.plan_status || null,
            item.plan_result || null,
            item.plan_time || null,
            item.plan_goal || null,
            item.sort_order || i
          ]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/work-reports/:id/submit - 提交汇报
router.put('/:id/submit', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const reportId = req.params.id;
    const { followCount, newSchoolCount, signedSchoolCount, notes, items } = req.body;

    // 校验归属
    const report = await queryOne(
      'SELECT * FROM work_reports WHERE id = ? AND user_id = ?',
      [reportId, userId]
    );

    if (!report) {
      return res.status(404).json({ success: false, message: '汇报记录不存在' });
    }

    if (report.status === '已提交') {
      return res.json({ success: true, message: '汇报已提交' });
    }

    // 检查是否已有其他已提交的同周期汇报
    const otherSubmitted = await queryOne(
      'SELECT * FROM work_reports WHERE user_id = ? AND report_type = ? AND period = ? AND status = ? AND id != ?',
      [userId, report.report_type, report.period, '已提交', reportId]
    );
    if (otherSubmitted) {
      return res.status(400).json({ success: false, message: `您已提交过${report.period}的汇报，每周只能提交一次` });
    }

    // 更新主表统计和状态
    await run(
      `UPDATE work_reports SET follow_count = ?, new_school_count = ?, signed_school_count = ?, notes = ?, status = ?, submitted_at = datetime('now') WHERE id = ?`,
      [followCount || 0, newSchoolCount || 0, signedSchoolCount || 0, notes || null, '已提交', reportId]
    );

    // 删除旧明细
    await run('DELETE FROM work_report_items WHERE report_id = ?', [reportId]);

    // 插入新明细
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await run(
          `INSERT INTO work_report_items (report_id, item_type, item_date, school_name, content, next_plan, plan_status, plan_result, plan_time, plan_goal, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            item.item_type,
            item.item_date || null,
            item.school_name || null,
            item.content || null,
            item.next_plan || null,
            item.plan_status || null,
            item.plan_result || null,
            item.plan_time || null,
            item.plan_goal || null,
            item.sort_order || i
          ]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/work-reports/:id - 删除汇报（销售仅草稿，超管可删除任意）
router.delete('/:id', async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const reportId = req.params.id;

    let report;
    if (role === '超级管理员') {
      report = await queryOne('SELECT * FROM work_reports WHERE id = ?', [reportId]);
    } else if (role === '一级部门负责人') {
      return res.status(403).json({ success: false, message: '部门负责人无权删除汇报' });
    } else {
      report = await queryOne(
        'SELECT * FROM work_reports WHERE id = ? AND user_id = ?',
        [reportId, userId]
      );
    }

    if (!report) {
      return res.status(404).json({ success: false, message: '汇报记录不存在' });
    }

    if (role !== '超级管理员' && report.status === '已提交') {
      return res.status(400).json({ success: false, message: '已提交的汇报不能删除' });
    }

    await run('DELETE FROM work_report_items WHERE report_id = ?', [reportId]);
    await run('DELETE FROM work_reports WHERE id = ?', [reportId]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 辅助接口 ───

// GET /api/work-reports/:id/follow-records - 自动拉取周期内跟进记录
router.get('/:id/follow-records', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const reportId = req.params.id;

    // 校验汇报归属
    const report = await queryOne(
      'SELECT * FROM work_reports WHERE id = ? AND user_id = ?',
      [reportId, userId]
    );

    if (!report) {
      return res.status(404).json({ success: false, message: '汇报记录不存在' });
    }

    const dateRange = getPeriodDateRange(report.period, report.report_type);

    const records = await query(
      `SELECT fr.*, s.name as school_name, s.status as school_status
       FROM follow_records fr
       INNER JOIN schools s ON fr.school_id = s.id
       WHERE fr.user_id = ?
         AND fr.created_at >= ?
         AND fr.created_at <= ?
       ORDER BY fr.created_at DESC`,
      [userId, dateRange.start, dateRange.end]
    );

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
