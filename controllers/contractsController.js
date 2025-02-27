const catchAsync = require('../helpers/catchAsync');
const AutomatedInvoice = require('../models/AutomatedInvoice');
const Contract = require('../models/Contract');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { createNotification } = require('../notifications/notification');
const { sendEmail } = require('../services/email.service');
/* const {
  AutoInvoiceData,
  generateInvoiceID,
  paymentData,
} = require('../utils/invoicehelpers'); */

function calculateDurationHours(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMillis = endDate - startDate;
  const durationHours = durationMillis / (1000 * 60 * 60);
  return durationHours;
}

const AutoInvoiceData = (formState) => {
  const hoursSpent = calculateDurationHours(formState.start, formState.end);

  const additionalEquipmentsArray = formState?.additionalEquipments?.map(
    (a) => ({
      description: a.type,
      hours: hoursSpent,
      rate: a.rate,
    })
  );

  const djServiceArray = [
    {
      description: 'DJ Service',
      rate: 1,
      hours: hoursSpent,
      amount: 1 * hoursSpent,
    },
  ];

  const mergedArray = [...djServiceArray, ...additionalEquipmentsArray];

  const newInvoicetabledata = mergedArray.map((a) => ({
    description: a.description,
    hours: a.hours,
    rate: a.rate,
    amount: a.hours * a.rate,
  }));

  const subtotal = newInvoicetabledata.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const tax = +(subtotal * 0.1).toFixed(1);
  const dueAmount = +(subtotal + tax).toFixed(1);

  return {
    newInvoicetabledata,
    totals: { subtotal, tax, dueAmount },
  };
};

const ContractsController = {
  createContract: catchAsync(async (req, res, next) => {
    const {
      cancellation,
      paymentStructure,
      booking,
      signature,
      contractTitle,
      bookingData,
      autoinvoicedata,
      clientEmail,
    } = req.body;

    const newContract = await Contract.create({
      cancellation,
      paymentStructure,
      booking,
      signature,
      contractTitle,
      user: req.user.id,
    });

    if (!newContract) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to create contract' });
    }

    if (
      autoinvoicedata?.automated === true &&
      autoinvoicedata?.eventTypeTrigger === 'AFTER_CONTRACT'
    ) {
      const invoice = await Invoice.create({
        ...autoinvoicedata,
        ...bookingData,
        booking: bookingData.value,
        invoiceTableData: [...autoinvoicedata?.invoicetabledata],
        paymentInfo: {
          ...autoinvoicedata?.paymentOption,
        },
        paid: false,
        invoiceTitle: contractTitle,
        user: req.user.id,
      });

      const link = `${
        process.env.BASE_URL
      }/documents/invoice/show/${invoice._id.toString()}`;

      const subject = 'View Invoice';

      const context = {
        link,
      };

      const isEmailSent = await sendEmail(
        bookingData.clientEmail,
        subject,
        'invoice',
        context
      );

      if (!isEmailSent) {
        return res
          .status(400)
          .json({ success: false, message: 'An error occurred while sending' });
      }
    }

    const link = `${
      process.env.BASE_URL
    }/documents/sign/${newContract._id.toString()}`;

    /* 
    const link = `${
      process.env.BASE_URL
    }/documents/contract/show/${newContract._id.toString()}`; */
    const subject = 'Sign Contract';

    const context = {
      link,
    };

    const isEmailSent = await sendEmail(
      bookingData.clientEmail,
      subject,
      'signcontract',
      context
    );

    if (!isEmailSent) {
      return res
        .status(400)
        .json({ success: false, message: 'An error occurred while sending' });
    }
    return res.status(200).json({ success: true, data: newContract });
  }),

  getAllContracts: catchAsync(async (req, res, next) => {
    const contracts = await Contract.find({ user: req.user.id }).populate(
      'booking'
    );
    return res.status(200).json({ success: true, data: contracts });
  }),

  signContract: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { response } = req.body;
    const io = req.app.get('IO');

    const contract = await Contract.findById(id).populate('booking');
    if (!contract) {
      return res
        .status(400)
        .json({ success: false, message: 'Contract not found' });
    }
    if (contract.signature !== '') {
      return res
        .status(400)
        .json({ success: false, message: 'Already signed' });
    }

    const contractNotification = await createNotification({
      type: 'contract',
      title: 'has signed the contract',
      content: contract?.contractTitle,
      sender: contract?.booking?.client?.name,
      user: contract.user,
      link: '/documents',
    });

    io.to(contract.user.toString()).emit(
      'new_notification',
      contractNotification
    );

    contract.signature = response;
    contract.save();

    return res.status(200).json({ success: true, data: contract });
  }),

  getContract: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const contract = await Contract.findById(id).populate('booking');

    return res.status(200).json({ success: true, data: contract });
  }),

  updateContract: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const contract = await Contract.findByIdAndUpdate(id, { ...req.body });

    if (contract.user !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Can't edit contract. Not authorized",
      });
    }

    return res.status(200).json({ success: true, data: contract });
  }),

  deleteContract: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (contract.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Can't delete contract. Not authorized",
      });
    }

    await Contract.findByIdAndDelete(contract._id);

    return res
      .status(200)
      .json({ success: true, message: 'Contract deleted successfully' });
  }),
};

module.exports = ContractsController;
