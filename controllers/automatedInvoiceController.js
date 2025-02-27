const { get } = require('mongoose');

const AutomatedInvoice = require('../models/AutomatedInvoice');

const AutomatedInvoiceController = {
  getAutomatedInvoice: async (req, res) => {
    try {
      const userId = req.user.id;
      const automatedInvoice = await AutomatedInvoice.find({
        user: userId,
      });
      return res.status(200).json({
        success: true,
        message: 'Automated invoice data',
        data: automatedInvoice,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message ||
          'An error occurred while retrieving automated invoice data',
      });
    }
  },
  createAutomatedInvoice: async (req, res) => {
    try {
      const userId = req.user.id;
      const automatedInvoices = await AutomatedInvoice.find({
        user: userId,
      });
      const { enabled, dueDate, eventTypeTrigger, paymentOptions } = req.body;

      if (automatedInvoices.length > 0) {
        const automatedInvoice = automatedInvoices[0];
        automatedInvoice.enabled = enabled;
        automatedInvoice.dueDate = dueDate;
        automatedInvoice.eventTypeTrigger = eventTypeTrigger;
        automatedInvoice.paymentOptions = paymentOptions;

        await automatedInvoice.save();

        return res.status(200).json({
          success: true,
          message: 'Automated invoice updated successfully for this user',
          data: automatedInvoice,
        });
      }

      const automatedInvoiceData = await AutomatedInvoice.create({
        enabled,
        dueDate,
        eventTypeTrigger,
        paymentOptions,
        user: userId,
      });

      return res.status(201).json({
        success: true,
        message: 'Automated Invoice created successfully for this user',
        data: automatedInvoiceData,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message || 'An error occurred while creating automated invoice',
      });
    }
  },

  updateAutomatedInvoice: async (req, res) => {
    try {
      const userId = req.user.id;
      const { enabled, dueDate, eventTypeTrigger, paymentOptions } = req.body;
      const automatedInvoice = await AutomatedInvoice.findOneAndUpdate(
        { user: userId },
        { enabled, dueDate, eventTypeTrigger, paymentOptions },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: 'Automated Invoice updated successfully for this user',
        data: automatedInvoice,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message ||
          'An error occurred while updating automated invoice for this uer',
      });
    }
  },

  deleteAutomatedInvoice: async (req, res) => {
    try {
      const userId = req.user.id;
      await AutomatedInvoice.findOneAndDelete({
        user: userId,
      });
      return res.status(200).json({
        success: true,
        message: 'Automated inoice deleted successfully for this user',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message ||
          'An error occurred while deleting automated invoice for this user',
      });
    }
  },
};

module.exports = AutomatedInvoiceController;
