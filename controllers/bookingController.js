const { date } = require('joi');
const catchAsync = require('../helpers/catchAsync');
const Booking = require('../models/Booking');
const Contract = require('../models/Contract');
const User = require('../models/User');
const { createNotification } = require('../notifications/notification');
const { sendEmail } = require('../services/email.service');
const { themes } = require('../services/events/generate_styling');

const BookingsController = {
  createBooking: catchAsync(async (req, res, next) => {
    const booking = req.body;

    const { backgroundColor, borderColor, textColor } = themes[6];
    const newBooking = await Booking.create({
      ...booking,
      user: req.user.id,
      backgroundColor,
      borderColor,
      textColor,
    });
    const profile_link = `${
      process.env.BASE_URL
    }/profile/${req.user.id.toString()}`;

    const context = {
      client: {
        title: newBooking?.title || 'Booking',
        name: newBooking?.client?.name || 'User',
      },
      profile_link,
    };

    const isEmailSent = await sendEmail(
      newBooking?.client?.email || '',
      `New Booking Request ${newBooking?.title}`,
      'newBookingByUser',
      context
    );

    if (!isEmailSent) {
      return res.status(400).json({
        success: false,
        message: 'An error occurred while sending confirmation email',
      });
    }

    return res.status(200).json({ success: true, data: newBooking });
  }),

  createBookingUnauth: catchAsync(async (req, res, next) => {
    const booking = req.body;
    const { id } = req.params;
    const io = req.app.get('IO');

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ success: false, message: 'DJ not found' });
    }

    const { backgroundColor, borderColor, textColor } = themes[6];
    const newBooking = await Booking.create({
      ...booking,
      user: id,
      backgroundColor,
      borderColor,
      textColor,
    });

    const profile_link = `${process.env.BASE_URL}/profile/${id.toString()}`;

    const booking_link = `${
      process.env.BASE_URL
    }/bookings?booking=${newBooking._id.toString()}`;

    const context = {
      booking_link,
      user: {
        firstName: user.firstName,
      },
      externalUser: {
        name: newBooking?.client?.name || 'User',
        email: newBooking?.client?.email || '',
      },
    };

    const context2 = {
      client: {
        title: newBooking?.title || 'Booking',
        name: newBooking?.client?.name || 'User',
      },
      profile_link,
    };

    const isEmailSent2 = await sendEmail(
      newBooking?.client?.email || '',
      `New Booking Request ${newBooking?.title}`,
      'newBookingForExternal',
      context2
    );

    if (!isEmailSent2) {
      return res.status(400).json({
        success: false,
        message: 'An error occurred while sending confirmation email',
      });
    }

    if (user.allowBookingNotifications) {
      const isEmailSent = await sendEmail(
        user.email,
        'New Booking Request',
        'newBookingByExternal',
        context
      );

      if (!isEmailSent) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while sending confirmation email',
        });
      }
    }

    const bookingNotification = await createNotification({
      type: 'booking',
      title: 'requested a new booking',
      content: newBooking?.title,
      sender: newBooking?.client?.name,
      user: newBooking.user,
      link: '/bookings',
    });

    io.to(newBooking.user.toString()).emit(
      'new_notification',
      bookingNotification
    );

    return res.status(200).json({ success: true, data: newBooking });
  }),
  getBooking: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    return res.status(200).json({ success: true, data: booking });
  }),
  respondToBooking: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { response } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(400)
        .json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'pending') {
      return res
        .status(400)
        .json({ success: false, message: 'Already responded' });
    }

    // if (booking.user.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: 'Not allowed to approve booking' });
    // }

    booking.status = response;
    booking.save();

    const automatedContract = await AutomatedContract.find({
      user: req.user._id,
    });

    const profile_link = `${
      process.env.BASE_URL
    }/profile/${req.user.id.toString()}`;

    if (response === 'approved') {
      const context = {
        client: {
          name: booking?.client?.name || 'User',
        },
        booking: {
          title: booking?.title || 'Booking',
          date: new Date(booking?.start).toDateString(),
          time: new Date(booking?.start).toLocaleTimeString(),
        },
        profile_link,
      };

      const isEmailSent = await sendEmail(
        booking?.client?.email || '',
        `${booking?.title} Booking Approved`,
        'approvedBooking',
        context
      );

      if (!isEmailSent) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while sending approval email',
        });
      }
    }

    if (response === 'cancelled') {
      const context = {
        client: {
          name: booking?.client?.name || 'User',
        },
        booking: {
          title: booking?.title || 'Booking',
          date: new Date(booking?.start).toDateString(),
          time: new Date(booking?.start).toLocaleTimeString(),
        },
        profile_link,
      };

      const isEmailSent = await sendEmail(
        booking?.client?.email || '',
        `${booking?.title} Booking Cancelled`,
        'cancelledBooking',
        context
      );

      if (!isEmailSent) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while sending cancellation email',
        });
      }
    }

    if (automatedContract[0]?.enabled) {
      const newContract = await Contract.create({
        contractTitle: booking.title,
        paymentStructure: automatedContract[0].payment,
        cancellation: automatedContract[0].cancellation,
        signature: automatedContract[0].signature,
        creationDate: Date.now(),
        clientName: booking.client.name,
        clientEmail: booking.client.email,
        bookingTitle: booking.client.title,
        booking: booking._id,
        user: req.user._id,
      });

      const link = `${
        process.env.BASE_URL
      }/documents/sign/${newContract._id.toString()}`;

      const subject = 'Sign Contract';

      const context = {
        link,
      };

      const isEmailSent = await sendEmail(
        booking.client.email,
        subject,
        'signcontract',
        context
      );

      if (!isEmailSent) {
        return res
          .status(400)
          .json({ success: false, message: 'An error occurred while sending' });
      }
    }

    return res.status(200).json({ success: true, data: booking });
  }),
  editBooking: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let booking = await Booking.findById(id);

    if (booking?.user?.id !== req?.user?._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Can't edit booking. Not authorized",
      });
    }

    booking = await Booking.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
      }
    );

    const profile_link = `${
      process.env.BASE_URL
    }/profile/${req.user.id.toString()}`;

    const context = {
      client: {
        name: booking?.client?.name || 'User',
      },
      booking: {
        startDate: new Date(booking?.start).toDateString(),
        startTime: new Date(booking?.start).toLocaleTimeString(),
        endDate: new Date(booking?.end).toDateString(),
        endTime: new Date(booking?.end).toLocaleTimeString(),
      },
      profile_link,
    };

    const isEmailSent = await sendEmail(
      booking?.client?.email || '',
      `${booking?.title} Booking Updated`,
      'updatedBooking',
      context
    );

    if (!isEmailSent) {
      return res.status(400).json({
        success: false,
        message: 'An error occurred while sending confirmation email',
      });
    }

    return res.status(200).json({ success: true, data: booking });
  }),
  getAllBookings: catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, data: bookings });
  }),

  getAllBookingsforUser: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const bookings = await Booking.find({ user: id });

    return res.status(200).json({ success: true, data: bookings });
  }),

  deleteBooking: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Can't delete booking if not cancelled",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Can't delete booking. Not authorized",
      });
    }

    await Booking.findByIdAndDelete(booking._id);

    return res
      .status(200)
      .json({ success: true, message: 'Booking deleted successfully' });
  }),

  getAllBookingsforAdmin: catchAsync(async (req, res) => {
    const allBookings = await Booking.find();
    return res.status(200).json({ success: true, data: allBookings });
  }),
};

module.exports = BookingsController;
