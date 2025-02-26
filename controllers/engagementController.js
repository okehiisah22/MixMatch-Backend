const Engagement = require('../models/Engagement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { Types } = require('mongoose');

const engagementController = {
    // Create engagement
    createEngagement: async (req, res) => {
        try {
            const { targetType, target, type, commentText, sharePlatform } = req.body;
            const userId = req.user._id;

            // Check if target exists
            const targetModel = targetType === 'DJ' ? User : Event; // Assuming you have an Event model
            const targetExists = await targetModel.exists({ _id: target });
            if (!targetExists) {
                return res.status(404).json({ error: 'Target not found' });
            }

            // Check for existing engagement
            const existingEngagement = await Engagement.findOne({
                user: userId,
                target,
                type
            });

            if (existingEngagement) {
                return res.status(400).json({ error: 'Engagement already exists' });
            }

            const engagementData = {
                user: userId,
                targetType,
                target,
                type,
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            };

            if (type === 'comment') {
                if (!commentText) {
                    return res.status(400).json({ error: 'Comment text is required' });
                }
                engagementData.comment = {
                    text: commentText,
                    user: userId
                };
            }

            if (type === 'share') {
                if (!sharePlatform) {
                    return res.status(400).json({ error: 'Share platform is required' });
                }
                engagementData.sharePlatform = sharePlatform;
            }

            const engagement = await Engagement.create(engagementData);

            // Create notification
            if (type !== 'share') { // Adjust based on your notification needs
                const targetUser = await targetModel.findById(target).select('_id');
                await Notification.create({
                    user: targetUser._id,
                    type,
                    message: `New ${type} on your ${targetType.toLowerCase()}`,
                    relatedEngagement: engagement._id,
                    relatedDJ: targetType === 'DJ' ? target : null
                });
            }

            res.status(201).json(engagement);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get engagements for a target
    getEngagements: async (req, res) => {
        try {
            const { targetId, type } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const engagements = await Engagement.find({ target: targetId, type })
                .populate('user', 'firstName lastName profilePicture')
                .sort('-createdAt')
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const count = await Engagement.countDocuments({ target: targetId, type });

            res.json({
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                engagements
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete engagement
    deleteEngagement: async (req, res) => {
        try {
            const { id } = req.params;
            const engagement = await Engagement.findByIdAndDelete(id);

            if (!engagement) {
                return res.status(404).json({ error: 'Engagement not found' });
            }

            // Delete associated notification
            await Notification.deleteOne({ relatedEngagement: engagement._id });

            res.json({ message: 'Engagement removed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get engagement metrics for a DJ
    getDJMetrics: async (req, res) => {
        try {
            const { djId } = req.params;

            const metrics = await Engagement.aggregate([
                {
                    $match: {
                        targetType: 'DJ',
                        target: Types.ObjectId(djId)
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        type: '$_id',
                        count: 1
                    }
                }
            ]);

            const result = {
                likes: 0,
                comments: 0,
                shares: 0
            };

            metrics.forEach(metric => {
                result[metric.type + 's'] = metric.count;
            });

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Moderate comment
    moderateComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            const engagement = await Engagement.findByIdAndUpdate(
                id,
                {
                    'comment.status': status,
                    'comment.moderatedBy': req.user._id,
                    'comment.moderationReason': reason,
                    'comment.updatedAt': Date.now()
                },
                { new: true }
            );

            if (!engagement) {
                return res.status(404).json({ error: 'Engagement not found' });
            }

            // Create moderation notification
            await Notification.create({
                user: engagement.user,
                type: 'engagement_update',
                message: `Your comment has been ${status}`,
                relatedEngagement: engagement._id
            });

            res.json(engagement);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = engagementController;