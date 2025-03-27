import mongoose from "mongoose";
import Notification, {
  NOTIFICATION_TYPES,
  type INotification,
} from "../models/notification.model";

describe("Notification Model", () => {
  // Test data
  const validNotificationData: Omit<
    INotification,
    "_id" | "createdAt" | "updatedAt"
  > = {
    userId: new mongoose.Types.ObjectId(),
    message: "Test notification message",
    type: "message",
    isRead: false,
  };

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/mixmatch-test",
      {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      }
    );
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      // 0 = disconnected
      await mongoose.connection.db?.dropDatabase();
      await mongoose.connection.close();
    }
  });

  afterEach(async () => {
    await Notification.deleteMany({});
  });

  describe("Notification Creation", () => {
    it("should create and save notification successfully", async () => {
      const notification = new Notification(validNotificationData);
      const savedNotification = await notification.save();

      expect(savedNotification._id).toBeDefined();
      expect(savedNotification.userId.toString()).toEqual(
        validNotificationData.userId.toString()
      );
      expect(savedNotification.message).toBe(validNotificationData.message);
      expect(savedNotification.type).toBe(validNotificationData.type);
      expect(savedNotification.isRead).toBe(false);
      expect(savedNotification.createdAt).toBeInstanceOf(Date);
      expect(savedNotification.updatedAt).toBeInstanceOf(Date);
    });

    it("should set default isRead to false when not provided", async () => {
      const { isRead, ...notificationData } = validNotificationData;
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      expect(savedNotification.isRead).toBe(false);
    });

    it("should accept all valid notification types", async () => {
      for (const type of NOTIFICATION_TYPES) {
        const notification = new Notification({
          ...validNotificationData,
          type,
        });
        const savedNotification = await notification.save();
        expect(savedNotification.type).toBe(type);
        await Notification.deleteOne({ _id: savedNotification._id });
      }
    });
  });

  describe("Field Validation", () => {
    it("should require userId field", async () => {
      const { userId, ...invalidData } = validNotificationData;
      const notification = new Notification(invalidData);

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("should require message field", async () => {
      const { message, ...invalidData } = validNotificationData;
      const notification = new Notification(invalidData);

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("should require type field", async () => {
      const { type, ...invalidData } = validNotificationData;
      const notification = new Notification(invalidData);

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("should reject invalid notification types", async () => {
      const notification = new Notification({
        ...validNotificationData,
        type: "invalid_type" as any,
      });

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("should enforce message length limit (500 chars)", async () => {
      const longMessage = "a".repeat(501);
      const notification = new Notification({
        ...validNotificationData,
        message: longMessage,
      });

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });
  });

  describe("Database Indexes", () => {
    it("should have index on userId field", async () => {
      const indexes = await Notification.collection.indexInformation();
      expect(indexes).toHaveProperty("userId_1");
    });

    it("should have index on isRead field", async () => {
      const indexes = await Notification.collection.indexInformation();
      expect(indexes).toHaveProperty("isRead_1");
    });

    it("should have compound index on userId and isRead", async () => {
      const indexes = await Notification.collection.indexInformation();
      expect(indexes).toHaveProperty("userId_1_isRead_1");
    });
  });
});
