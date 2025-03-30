const express = require('express');
const router = express.Router();
const DJReportController = require('../controllers/djReportController');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User routes
router.post(
  '/report/dj',
  [
    authMiddleware,
    check('djId', 'DJ ID is required').notEmpty(),
    check('reason', 'Reason is required').notEmpty(),
    check('details', 'Details must be between 10 and 1000 characters').isLength(
      { min: 10, max: 1000 }
    ),
  ],
  DJReportController.reportDJ
);

// Admin routes
router.get(
  '/reports/dj',
  [authMiddleware, adminMiddleware],
  DJReportController.getDJReports
);

router.put(
  '/reports/dj/:reportId/status',
  [
    authMiddleware,
    adminMiddleware,
    check('status', 'Valid status is required').isIn([
      'pending',
      'reviewed',
      'resolved',
      'dismissed',
    ]),
  ],
  DJReportController.updateReportStatus
);

module.exports = router;
