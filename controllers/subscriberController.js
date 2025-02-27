const catchAsync = require("../helpers/catchAsync");
const SubscriberModel = require("../models/Subscribers");
const User = require("../models/User");

module.exports = {
  createSubscriber: catchAsync(async (req, res) => {
    const { email } = req.body;

    const existingSubscriber = await SubscriberModel.findOne({
      email,
    });

    if (existingSubscriber) {
      return res.status(400).json({ message: "Already subscribed" });
    }
    await SubscriberModel.create({
      email,
    });
    res.status(201).json({ message: "Thank you for joining our mailing list" });
  }),

  getAllSubscribers: catchAsync(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.isAdmin) {
      const allSubscribers = await SubscriberModel.find();
      return res.status(201).json({ message: "success", data: allSubscribers });
    } else {
      return res.status(401).json({ message: "User is not an admin" });
    }
  }),
};
