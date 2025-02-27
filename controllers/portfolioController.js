const Gallery = require('../models/Portfolio');
const Testimonial = require('../models/Testimonial');
const PortfolioAnalytics = require('../models/PortfolioAnalytics');
const User = require('../models/User');
const { Types } = require('mongoose');

const portfolioController = {
  // Gallery Management
  createGallery: async (req, res) => {
    try {
      const { title, description, eventDate, tags, location } = req.body;
      const gallery = await Gallery.create({
        dj: req.user._id,
        title,
        description,
        eventDate,
        tags,
        location
      });
      res.status(201).json(gallery);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addGalleryMedia: async (req, res) => {
    try {
      const { galleryId } = req.params;
      const mediaItem = req.body;
      
      const gallery = await Gallery.findOneAndUpdate(
        { _id: galleryId, dj: req.user._id },
        { $push: { media: mediaItem } },
        { new: true }
      );
      
      if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getDJGalleries: async (req, res) => {
    try {
      const { djId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const galleries = await Gallery.find({ dj: djId })
        .sort('-createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await Gallery.countDocuments({ dj: djId });

      res.json({
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        galleries
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Testimonial Management
  createTestimonial: async (req, res) => {
    try {
      const { djId, text, rating } = req.body;
      
      const testimonial = await Testimonial.create({
        dj: djId,
        user: req.user._id,
        text,
        rating
      });

      res.status(201).json(testimonial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  moderateTestimonial: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectedReason } = req.body;

      const update = { status };
      if (status === 'approved') update.approvedAt = Date.now();
      if (status === 'rejected') update.rejectedReason = rejectedReason;

      const testimonial = await Testimonial.findByIdAndUpdate(
        id,
        update,
        { new: true }
      );

      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Analytics Tracking
  trackInteraction: async (req, res) => {
    try {
      const { itemType, itemId, action } = req.body;
      
      const analyticsRecord = await PortfolioAnalytics.create({
        dj: req.params.djId,
        itemType,
        itemId,
        action,
        user: req.user?._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Update counters
      switch(itemType) {
        case 'gallery':
          await Gallery.updateOne({ _id: itemId }, { $inc: { views: 1 }});
          break;
        case 'media':
          await Gallery.updateOne(
            { 'media._id': itemId },
            { $inc: { 'media.$.plays': 1 } }
          );
          break;
      }

      res.status(201).json(analyticsRecord);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Portfolio Analytics
  getPortfolioAnalytics: async (req, res) => {
    try {
      const { djId } = req.params;
      const { period = '7d' } = req.query;

      const dateFilter = getDateFilter(period);
      
      const analytics = await PortfolioAnalytics.aggregate([
        { $match: { dj: Types.ObjectId(djId), createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: { itemType: "$itemType", action: "$action" },
            count: { $sum: 1 },
            lastInteraction: { $max: "$createdAt" }
          }
        },
        {
          $project: {
            _id: 0,
            itemType: "$_id.itemType",
            action: "$_id.action",
            count: 1,
            lastInteraction: 1
          }
        }
      ]);

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

function getDateFilter(period) {
  const now = new Date();
  switch(period) {
    case '24h': return new Date(now - 24*60*60*1000);
    case '7d': return new Date(now - 7*24*60*60*1000);
    case '30d': return new Date(now - 30*24*60*60*1000);
    default: return new Date(0);
  }
}

module.exports = portfolioController;