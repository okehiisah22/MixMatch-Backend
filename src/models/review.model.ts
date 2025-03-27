import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './user.model';
import { IDJProfile } from './DjProfile.model';

export interface IReview extends Document {
  clientId: Types.ObjectId | IUser;
  djId: Types.ObjectId | IUser;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required'],
    validate: {
      validator: async function (value: Types.ObjectId) {
        const user = await mongoose.model<IUser>('User').findById(value);
        return user?.role === 'event_planner'; 
      },
      message: 'Only event planners (clients) can create reviews'
    }
  },
  djId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dj ID is required'],
    validate: {
      validator: async function (value: Types.ObjectId) {
        const [user, profile] = await Promise.all([
          mongoose.model<IUser>('User').findById(value),
          mongoose.model<IDJProfile>('DJProfile').findOne({ user: value })
        ]);
        return user?.role === 'dj' && !!profile;
      },
      message: 'DJ must exist and have a valid profile'
    }
  },
  rating: {
    type: Number,
    required: [true, 'Rating between 1-5 is required'],
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes for optimal query performance
ReviewSchema.index({ djId: 1, createdAt: -1 }); // For fetching DJ's recent reviews
ReviewSchema.index({ clientId: 1, djId: 1 }, { unique: true }); // Prevent duplicate reviews

// Virtual population for easy data retrieval
ReviewSchema.virtual('client', {
  ref: 'User',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

ReviewSchema.virtual('dj', {
  ref: 'User',
  localField: 'djId',
  foreignField: '_id',
  justOne: true
});

// Prevent duplicate reviews pre-save hook
ReviewSchema.pre<IReview>('save', async function (next) {
  const existingReview = await Review.findOne({
    clientId: this.clientId,
    djId: this.djId
  });

  if (existingReview) {
    throw new Error('User has already submitted a review for this DJ');
  }
  next();
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
