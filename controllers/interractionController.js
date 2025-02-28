const Interaction = require('../models/Interaction');

exports.createInteraction = async (req, res) => {
  try {
    const interaction = new Interaction({
      userId: req.body.userId,
      eventId: req.body.eventId,
      actionType: req.body.actionType,
      metadata: req.body.metadata,
    });

    await interaction.save();
    res.status(201).json(interaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
