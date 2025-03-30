const express = require('express');
const router = express.Router();
const UserReportController = require('../controllers/userReportController');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post(
  '/report/user',
  [
    authMiddleware,
    check('reportedUserId', 'Reported user ID is required').notEmpty(),
    check('reason', 'Reason is required').notEmpty(),
    check('details', 'Details must be between 10 and 1000 characters').isLength(
      { min: 10, max: 1000 }
    ),
  ],
  UserReportController.reportUser
);

router.get(
  '/reports/user',
  [authMiddleware, adminMiddleware],
  UserReportController.getUserReports
);

router.put(
  '/reports/user/:reportId/handle',
  [
    authMiddleware,
    adminMiddleware,
    check('status', 'Valid status is required').isIn([
      'pending',
      'reviewed',
      'resolved',
      'dismissed',
    ]),
    check('actionTaken', 'Valid action is required')
      .optional()
      .isIn(['none', 'warning', 'temporary_ban', 'permanent_ban']),
    check('actionDetails', 'Action details must be less than 500 characters')
      .optional()
      .isLength({ max: 500 }),
  ],
  UserReportController.handleReport
);

module.exports = router;
