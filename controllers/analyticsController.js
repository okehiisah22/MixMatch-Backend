const Interaction = require('../models/Interaction');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const buildMatchQuery = (queryParams) => {
  const { startDate, endDate, eventId, userId } = queryParams;
  const matchQuery = {};

  if (eventId) matchQuery.eventId = eventId;
  if (userId) matchQuery.userId = userId;

  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }

  return matchQuery;
};

exports.getInteractionAnalytics = async (req, res) => {
  try {
    const matchQuery = buildMatchQuery(req.query);

    const analytics = await Interaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          actionType: '$_id',
          count: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' },
        },
      },
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingAnalytics = async (req, res) => {
  try {
    const matchQuery = buildMatchQuery(req.query);

    const analytics = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
          averageTicketCount: { $avg: '$ticketCount' },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalRevenue: 1,
          averageTicketCount: 1,
        },
      },
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentAnalytics = async (req, res) => {
  try {
    const matchQuery = buildMatchQuery(req.query);

    const analytics = await Payment.aggregate([
      { $match: { ...matchQuery, status: 'success' } },
      {
        $group: {
          _id: '$paymentMethod',
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
        },
      },
      {
        $project: {
          paymentMethod: '$_id',
          totalRevenue: 1,
          transactionCount: 1,
          averageAmount: 1,
        },
      },
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSummaryAnalytics = async (req, res) => {
  try {
    const matchQuery = buildMatchQuery(req.query);

    const [interactions, bookings, payments] = await Promise.all([
      Interaction.countDocuments(matchQuery),
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$price' },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { ...matchQuery, status: 'success' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = {
      totalInteractions: interactions,
      totalBookings: bookings[0]?.totalBookings || 0,
      bookingRevenue: bookings[0]?.totalRevenue || 0,
      paymentRevenue: payments[0]?.totalRevenue || 0,
      totalTransactions: payments[0]?.transactionCount || 0,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
