const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'share', 'engagement_update'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedEngagement: {
        type: Schema.Types.ObjectId,
        ref: 'Engagement'
    },
    relatedDJ: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);