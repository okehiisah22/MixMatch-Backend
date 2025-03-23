import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { VerificationCode } from '../models/verification-code.model';
import dotenv from 'dotenv';

dotenv.config();
const seedData = [
  {
    email: 'test1@example.com',
    isVerified: false,
    verificationCode: '123456'
  },
  {
    email: 'test2@example.com',
    isVerified: true,
    verificationCode: '654321'
  }
];
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mixmatch';

async function seedDatabase() {
  console.log(MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI, {
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await VerificationCode.deleteMany({});
    console.log('Cleared existing data');

    for (const data of seedData) {
      const user = await User.create({
        email: data.email,
        isVerified: data.isVerified
      });
      console.log(`Created user: ${user.email}`);

      if (!data.isVerified) {
        await VerificationCode.create({
          email: data.email,
          code: data.verificationCode,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });
        console.log(`Created verification code for: ${data.email}`);
      }
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 
