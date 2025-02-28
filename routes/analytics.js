const express = require('express');
const router = express.Router();
const {
  getInteractionAnalytics,
  getBookingAnalytics,
  getPaymentAnalytics,
  getSummaryAnalytics,
} = require('../controllers/analyticsController');

router.get('/interactions', getInteractionAnalytics);
router.get('/bookings', getBookingAnalytics);
router.get('/payments', getPaymentAnalytics);
router.get('/summary', getSummaryAnalytics);

module.exports = router;
