import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  DJ = 'dj',
  EVENT_PLANNER = 'event_planner',
  ADMIN = 'admin',
}

export interface ISocialLogin {
  googleId?: string;
  appleId?: string;
  spotifyId?: string;
}

export interface IUser extends Document {
  spotifyId?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  profilePicture?: string;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  socialLogin?: ISocialLogin;
  refreshToken: string;
  topArtists?: string[];
  topGenres?: string[];
  bio?: string;
  mood?: string[];
  anthem?: {
    trackId: string;
    previewUrl: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'User role is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    topArtists: {
      type: [String],
    },
    topGenres: {
      type: [String],
    },
    bio: {
      type: String,
      trim: true,
    },
    mood: {
      type: [String],
      default: [],
    },
    anthem: {
      trackId: String,
      previewUrl: String,
    },
    socialLogin: {
      googleId: String,
      appleId: String,
      spotifyId: String,
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
