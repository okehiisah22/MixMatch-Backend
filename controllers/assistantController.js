const Assistant = require('../models/Assistant');

const AssistantController = {
  getAssistant: async (req, res) => {
    try {
      const userId = req.user.id;

      let assistant = await Assistant.findOne({ user: userId });

      if (!assistant) {
        await AssistantController.seedDefaultAssistant(req, res, userId);

        assistant = await Assistant.findOne({ user: userId });
      }

      return res.status(200).json({
        success: true,
        message: 'Automated assistant retrieved successfully',
        data: assistant,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message ||
          'An error occurred while retrieving automated replies',
      });
    }
  },

  updateAssistant: async (req, res) => {
    try {
      const userId = req.user.id;
      const { description } = req.body;

      const assistant = await Assistant.findOneAndUpdate(
        { user: userId, _id: req.params.id },
        { description },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Assistant updated successfully',
        data: assistant,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message || 'An error occurred while updating automated reply',
      });
    }
  },
  seedDefaultAssistant: async (req, res, userId) => {
    try {
      const assistant = [
        {
          description: 'Hello.',
          user: userId,
        },
      ];
      await Assistant.create(assistant);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          err?.message || 'An error occurred while seeding default replies',
      });
    }
  },
};

module.exports = AssistantController;
