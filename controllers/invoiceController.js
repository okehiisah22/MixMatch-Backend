const catchAsync = require('../helpers/catchAsync');

const Invoice = require('../models/Invoice');
const { sendEmail } = require('../services/email.service');

const InvoiceController = {
  createInvoice: catchAsync(async (req, res, next) => {
    const invoice = req.body;

    const newInvoice = await Invoice.create({
      ...invoice,
      user: req.user.id,
    });

    const link = `${
      process.env.BASE_URL
    }/documents/invoice/show/${newInvoice._id.toString()}`;

    const subject = 'View Invoice';

    const context = {
      link,
    };

    const isEmailSent = await sendEmail(
      newInvoice.clientEmail,
      subject,
      'invoice',
      context
    );

    if (!isEmailSent) {
      return res
        .status(400)
        .json({ success: false, message: 'An error occurred while sending' });
    }

    return res.status(200).json({ success: true, data: newInvoice });
  }),

  getAllInvoices: catchAsync(async (req, res, next) => {
    const invoice = await Invoice.find({ user: req.user.id });

    return res.status(200).json({ success: true, data: invoice });
  }),

  getAllUserInvoices: catchAsync(async (req, res, next) => {
    const invoice = await Invoice.find();
    return res.status(200).json({ success: true, data: invoice });
  }),

  markAsPaid: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { response } = req.body;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res
        .status(400)
        .json({ success: false, message: 'Invoice not found' });
    }
    if (invoice.paid !== false) {
      return res.status(400).json({ success: false, message: 'Already Paid' });
    }

    if (invoice.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: 'Not allowed to mark invoice' });
    }

    invoice.paid = true;
    invoice.save();

    return res.status(200).json({ success: true, data: invoice });
  }),

  getInvoice: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const invoice = await Invoice.findById(id).populate('booking');

    return res.status(200).json({ success: true, data: invoice });
  }),


  editInvoice: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const invvoice = await Invoice.findByIdAndUpdate(id, { ...req.body });

    if (invvoice.user !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Can't edit Invoice. Not authorized",
      });
    }

    return res.status(200).json({ success: true, data: booking });
  }),

  deleteInvoice: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);

    if (invoice.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Can't delete invoice. Not authorized",
      });
    }

    await Invoice.findByIdAndDelete(invoice._id);

    return res
      .status(200)
      .json({ success: true, message: 'Invoice deleted successfully' });
  }),
};

module.exports = InvoiceController;
