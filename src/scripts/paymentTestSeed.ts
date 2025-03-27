import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model"; // Adjust based on your structure
import { DJProfile } from "../models/DjProfile.model";
import Booking from "../models/Booking.model";
import Payment from "../models/payment.model";

dotenv.config();

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourDBName";

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("🔥 Connected to MongoDB!");

    // ✅ Insert Users
    const users = await User.insertMany([
      {
        _id: "65e4bc3f9c1a2b001cd245a1",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "hashed_password",
        role: "admin",
        phone: "+1234567890",
        profilePicture: "https://example.com/profile/john.jpg",
        isVerified: true,
      },
      {
        _id: "65e4bc3f9c1a2b001cd245a2",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice.smith@example.com",
        password: "hashed_password",
        role: "dj",
        phone: "+9876543210",
        profilePicture: "https://example.com/profile/alice.jpg",
        isVerified: true,
      },
    ]);

    console.log("✅ Users Inserted!");

    // ✅ Insert DJ Profiles
    await DJProfile.insertMany([
      {
        _id: "65e4bd4f9c1a2b001cd245b1",
        user: users[1]._id,
        bio: "Professional DJ with 10 years of experience.",
        genres: ["Hip-hop", "EDM", "House"],
        equipment: "Pioneer DJ Controller, Speakers",
        pricing: "$500 per event",
        portfolio: [
          "https://example.com/portfolio/image1.jpg",
          "https://example.com/portfolio/image2.jpg",
        ],
      },
    ]);

    console.log("✅ DJ Profiles Inserted!");

    // ✅ Insert Booking
    const booking = await Booking.create({
      _id: "65e4be5f9c1a2b001cd245c1",
      clientId: users[0]._id,
      djId: users[1]._id,
      eventId: null,
      date: new Date("2024-04-10T18:00:00Z"),
      price: 800,
      status: "pending",
    });

    console.log("✅ Booking Inserted!");

    // ✅ Insert Payment
    // await Payment.create({
    //   _id: "65e4bf6f9c1a2b001cd245d1",
    //   bookingId: booking._id,
    //   payerId: users[0]._id,
    //   receiverId: users[1]._id,
    //   amount: 800,
    //   status: "pending",
    //   transactionDate: new Date("2024-03-27T12:30:00Z"),
    // });

    // console.log("✅ Payment Inserted!");

    mongoose.connection.close();
    console.log("🚀 Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDB();
