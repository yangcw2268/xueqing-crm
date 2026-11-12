const express = require('express');
const { query } = require('../db/query');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/logs - 获取操作日志列表
 * 返回 logType: create | status_flow | follow_up | contract | contact | operation | device
 */
router.get('/', async (req, res) => {
  try {
    const { user_id, action_type, school_id } = req.query;
    const allLogs = [];

    // 1. 查询 audit_logs（学校创建等）
    {
      let sql = `
        SELECT a.id, a.user_id, u.name as user_name, a.action_type, a.target, a.detail, a.created_at
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (user_id) {
        sql += ' AND a.user_id = ?';
        params.push(user_id);
      }
      if (action_type) {
        sql += " AND a.action_type LIKE ?";
        params.push('%' + action_type + '%');
      }
      if (school_id) {
        sql += ` AND (a.action_type LIKE ? OR a.action_type LIKE ? OR a.action_type LIKE ?)`;
        params.push(`%/schools/${school_id}/%`, `PUT /schools/${school_id}`, `DELETE /schools/${school_id}`);
      }

      sql += ' ORDER BY a.created_at DESC';
      const auditLogs = await query(sql, params);

      // 将 audit_logs 映射为对应类型
      for (const log of auditLogs) {
        let logType = 'status_flow'; // 默认
        let detail = '';

        try {
          const parsed = typeof log.detail === 'string' ? JSON.parse(log.detail) : log.detail;
          detail = parsed.message || JSON.stringify(log.detail);
        } catch {
          detail = log.detail || '';
        }

        if (log.action_type && log.action_type.includes('/schools/') && !log.action_type.includes('/status')) {
          // 联系人相关
          if (log.action_type.includes('/contacts')) {
            logType = 'contact';
          }
          // 学校创建相关
          else if (log.action_type.includes('POST') || log.action_type.includes('创建')) {
            logType = 'create';
          }
        } else if (log.action_type && log.action_type.includes('DELETE') && log.action_type.includes('/schools/')) {
          logType = 'status_flow';
        }

        allLogs.push({
          ...log,
          logType,
          detail,
          source: 'audit'
        });
      }
    }

    // 2. 跟进记录
    {
      let followSql = `
        SELECT fr.id, fr.user_id, u.name as user_name,
               'follow_up' as logType,
               'follow_up' as action_type,
               s.name as target,
               fr.content as detail,
               fr.created_at, 'follow' as source
        FROM follow_records fr
        LEFT JOIN users u ON fr.user_id = u.id
        LEFT JOIN schools s ON fr.school_id = s.id
        WHERE 1=1
      `;
      const followParams = [];
      if (user_id) {
        followSql += ' AND fr.user_id = ?';
        followParams.push(user_id);
      }
      if (school_id) {
        followSql += ' AND fr.school_id = ?';
        followParams.push(school_id);
      }
      if (action_type) {
        followSql += " AND 'follow_up' = ?";
        followParams.push(action_type);
      }
      followSql += ' ORDER BY fr.created_at DESC';
      allLogs.push(...(await query(followSql, followParams)));
    }

    // 3. 运营记录（状态推进、暂停、恢复、运营人员变更、终止）
    {
      let opSql = `
        SELECT orr.id, orr.user_id, u.name as user_name,
               orr.type as logType,
               orr.type as action_type,
               s.name as target,
               orr.content as detail,
               orr.created_at, 'operation' as source
        FROM operation_records orr
        LEFT JOIN users u ON orr.user_id = u.id
        LEFT JOIN schools s ON orr.school_id = s.id
        WHERE 1=1
      `;
      const opParams = [];
      if (user_id) {
        opSql += ' AND orr.user_id = ?';
        opParams.push(user_id);
      }
      if (school_id) {
        opSql += ' AND orr.school_id = ?';
        opParams.push(school_id);
      }
      if (action_type) {
        opSql += " AND orr.type IN (" + action_type.split(',').map(() => '?').join(',') + ")";
        opParams.push(...action_type.split(','));
      }
      opSql += ' ORDER BY orr.created_at DESC';
      allLogs.push(...(await query(opSql, opParams)));
    }

    // 4. 联系人（新增记录）
    {
      let contactSql = `
        SELECT c.id, NULL as user_id, '系统' as user_name,
               'contact' as logType,
               'contact' as action_type,
               s.name as target,
               c.name || '（' || COALESCE(c.role, '') || '）' as detail,
               c.created_at, 'contact' as source
        FROM contacts c
        LEFT JOIN schools s ON c.school_id = s.id
        WHERE 1=1
      `;
      const contactParams = [];
      if (school_id) {
        contactSql += ' AND c.school_id = ?';
        contactParams.push(school_id);
      }
      if (action_type) {
        contactSql += " AND 'contact' = ?";
        contactParams.push(action_type);
      }
      contactSql += ' ORDER BY c.created_at DESC';
      allLogs.push(...(await query(contactSql, contactParams)));
    }

    // 5. 合同记录
    {
      let contractSql = `
        SELECT c.id, NULL as user_id, '系统' as user_name,
               'contract' as logType,
               'contract' as action_type,
               s.name as target,
               c.file_url as detail,
               c.created_at, 'contract' as source
        FROM contracts c
        LEFT JOIN schools s ON c.school_id = s.id
        WHERE 1=1
      `;
      const contractParams = [];
      if (school_id) {
        contractSql += ' AND c.school_id = ?';
        contractParams.push(school_id);
      }
      if (user_id) {
        contractSql += ' AND c.user_id = ?';
        contractParams.push(user_id);
      }
      if (action_type) {
        contractSql += " AND 'contract' = ?";
        contractParams.push(action_type);
      }
      contractSql += ' ORDER BY c.created_at DESC';
      allLogs.push(...(await query(contractSql, contractParams)));
    }

    // 6. 设备投放记录
    {
      let deviceSql = `
        SELECT dp.id, dp.user_id, u.name as user_name,
               'device' as logType,
               'device' as action_type,
               s.name as target,
               dp.quantity as detail,
               dp.created_at, 'device' as source
        FROM device_placements dp
        LEFT JOIN users u ON dp.user_id = u.id
        LEFT JOIN schools s ON dp.school_id = s.id
        WHERE 1=1
      `;
      const deviceParams = [];
      if (user_id) {
        deviceSql += ' AND dp.user_id = ?';
        deviceParams.push(user_id);
      }
      if (school_id) {
        deviceSql += ' AND dp.school_id = ?';
        deviceParams.push(school_id);
      }
      if (action_type) {
        deviceSql += " AND 'device' = ?";
        deviceParams.push(action_type);
      }
      deviceSql += ' ORDER BY dp.created_at DESC';
      allLogs.push(...(await query(deviceSql, deviceParams)));
    }

    // 按时间倒序排序
    allLogs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    res.json({ success: true, data: allLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
