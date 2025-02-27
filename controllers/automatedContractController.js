const { get } = require('mongoose');
const AutomatedContract = require('../models/AutomatedContract');

const AutomatedContractController = {
  getAutomatedContract: async (req, res) => {
    try {
      const userId = req.user.id;
      const automatedContract = await AutomatedContract.find({
        user: userId,
      });
      return res.status(200).json({
        success: true,
        message: 'Automated Contract data',
        data: automatedContract,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message ||
          'An error occurred while retrieving automated Contract data',
      });
    }
  },
  createAutomatedContract: async (req, res) => {
    try {
      const userId = req.user.id;
      const automatedContracts = await AutomatedContract.find({
        user: userId,
      });
      const { enabled, cancellation, signature, payment } = req.body;

      if (automatedContracts.length > 0) {
        const automatedContract = automatedContracts[0];
        automatedContract.enabled = enabled;
        automatedContract.cancellation = cancellation;
        automatedContract.signature = signature;
        automatedContract.payment = payment;

        await automatedContract.save();

        return res.status(200).json({
          success: true,
          message: 'Automated Contract updated successfully for this user',
          data: automatedContract,
        });
      }

      const automatedContractData = await AutomatedContract.create({
        enabled,
        cancellation,
        signature,
        payment,
        user: userId,
      });

      return res.status(201).json({
        success: true,
        message: 'Automated Contract created successfully for this user',
        data: automatedContractData,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message || 'An error occurred while creating automated Contract',
      });
    }
  },
};

module.exports = AutomatedContractController;
