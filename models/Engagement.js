const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
        maxlength: 500
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'flagged', 'removed'],
        default: 'active'
    },
    moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    moderationReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
}, { _id: false });

const engagementSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['DJ', 'Event'],
        required: true
    },
    target: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'share'],
        required: true
    },
    comment: commentSchema,
    sharePlatform: {
        type: String,
        enum: ['facebook', 'twitter', 'instagram', 'whatsapp', 'other']
    },
    metadata: {
        ipAddress: String,
        userAgent: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

engagementSchema.index({ user: 1, target: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Engagement', engagementSchema);