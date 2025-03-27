// import mongoose from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import Payment, { PaymentStatus, IPayment } from '../../models/payment.model';
// import { 
//   createPayment, 
//   getPaymentById, 
//   getAllPayments, 
//   updatePayment, 
//   deletePayment 
// } from '../../services/payment.service';
// import { Request, Response } from 'express';

// // Mock dependencies
// jest.mock('../../services/payment.service');

// describe('Payment Module', () => {
//   let mongoServer: MongoMemoryServer;
//   let mockPaymentId: string;
//   let mockPayment: IPayment;

//   // Increase timeout for potentially slow operations
//   jest.setTimeout(15000);

//   beforeAll(async () => {
//     // Create an in-memory MongoDB server
//     mongoServer = await MongoMemoryServer.create();
//     const mongoUri = mongoServer.getUri();

//     // Connect to the in-memory database
//     await mongoose.connect(mongoUri);
//   });

//   afterAll(async () => {
//     // Disconnect and stop the in-memory server
//     await mongoose.disconnect();
//     await mongoServer.stop();
//   });

//   beforeEach(() => {
//     // Clear the database before each test
//     mongoose.connection.dropDatabase();

//     // Create a mock payment object
//     mockPaymentId = new mongoose.Types.ObjectId().toString();
//     mockPayment = {
//       bookingId: new mongoose.Types.ObjectId(),
//       payerId: new mongoose.Types.ObjectId(),
//       receiverId: new mongoose.Types.ObjectId(),
//       amount: 100.50,
//       status: PaymentStatus.PENDING,
//       transactionDate: new Date(),
//     } as IPayment;
//   });

//   // Model Tests
//   describe('Payment Model', () => {
//     it('should create a valid payment', async () => {
//       const payment = new Payment(mockPayment);
//       const savedPayment = await payment.save();

//       expect(savedPayment.amount).toBe(mockPayment.amount);
//       expect(savedPayment.status).toBe(PaymentStatus.PENDING);
//     });

//     it('should not allow negative amount', async () => {
//       const invalidPayment = new Payment({
//         ...mockPayment,
//         amount: -100
//       });

//       await expect(invalidPayment.save()).rejects.toThrow('Amount cannot be negative');
//     });

//     it('should have default status as PENDING', () => {
//       const payment = new Payment(mockPayment);
//       expect(payment.status).toBe(PaymentStatus.PENDING);
//     });

//     it('should prevent modification of transactionDate', async () => {
//       const payment = new Payment(mockPayment);
//       const savedPayment = await payment.save();
      
//       const originalDate = savedPayment.transactionDate;
//       savedPayment.transactionDate = new Date('2000-01-01');
      
//       await savedPayment.save();
//       expect(savedPayment.transactionDate).toEqual(originalDate);
//     });
//   });

//   // Service Tests
//   describe('Payment Services', () => {
//     it('should create a payment', async () => {
//       (createPayment as jest.Mock).mockResolvedValue(mockPayment);
      
//       const result = await createPayment(mockPayment);
//       expect(result).toEqual(mockPayment);
//     });

//     it('should get payment by ID', async () => {
//       (getPaymentById as jest.Mock).mockResolvedValue(mockPayment);
      
//       const result = await getPaymentById(mockPaymentId);
//       expect(result).toEqual(mockPayment);
//     });

//     it('should get all payments', async () => {
//       const mockPayments = [mockPayment, { ...mockPayment, amount: 200 }];
//       (getAllPayments as jest.Mock).mockResolvedValue(mockPayments);
      
//       const result = await getAllPayments();
//       expect(result.length).toBe(2);
//     });

//     it('should update payment status', async () => {
//       const updatedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };
//       (updatePayment as jest.Mock).mockResolvedValue(updatedPayment);
      
//       const result = await updatePayment(mockPaymentId, { status: PaymentStatus.COMPLETED });
//       expect(result.status).toBe(PaymentStatus.COMPLETED);
//     });
//   });

//   // Static Method Tests
//   describe('Payment Model Static Methods', () => {
//     it('should find payments by booking ID', async () => {
//       const bookingId = new mongoose.Types.ObjectId();
//       const payment1 = new Payment({ ...mockPayment, bookingId });
//       const payment2 = new Payment({ ...mockPayment, bookingId });
      
//       await payment1.save();
//       await payment2.save();

//       const payments = await Payment.findByBooking(bookingId);
//       expect(payments.length).toBe(2);
//     });

//     it('should find payments by payer ID', async () => {
//       const payerId = new mongoose.Types.ObjectId();
//       const payment1 = new Payment({ ...mockPayment, payerId });
//       const payment2 = new Payment({ ...mockPayment, payerId });
      
//       await payment1.save();
//       await payment2.save();

//       const payments = await Payment.findByPayer(payerId);
//       expect(payments.length).toBe(2);
//     });
//   });
// });



import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Payment, { PaymentStatus, IPayment } from '../../models/payment.model';
import { 
  createPayment, 
  getPaymentById, 
  getAllPayments, 
  updatePayment, 
  deletePayment 
} from '../../services/payment.service';

// Mock dependencies
jest.mock('../../services/payment.service');

describe('Payment Module', () => {
  let mongoServer: MongoMemoryServer;
  let mockPaymentId: string;
  let mockPayment: IPayment;

  // Increase timeout for potentially slow operations
  jest.setTimeout(15000);

  beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Disconnect and stop the in-memory server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create a mock payment object
    mockPaymentId = new mongoose.Types.ObjectId().toString();
    mockPayment = {
      bookingId: new mongoose.Types.ObjectId(),
      payerId: new mongoose.Types.ObjectId(),
      receiverId: new mongoose.Types.ObjectId(),
      amount: 100.50,
      status: PaymentStatus.PENDING,
      transactionDate: new Date(),
    } as IPayment;

    // Clear all collections instead of dropping the entire database
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  // Model Tests
  describe('Payment Model', () => {
    it('should create a valid payment', async () => {
      const payment = new Payment(mockPayment);
      const savedPayment = await payment.save() as (IPayment & { _id: mongoose.Types.ObjectId });

      expect(savedPayment.amount).toBe(mockPayment.amount);
      expect(savedPayment.status).toBe(PaymentStatus.PENDING);
    });

    it('should not allow negative amount', async () => {
      const invalidPayment = new Payment({
        ...mockPayment,
        amount: -100
      });

      await expect(invalidPayment.save()).rejects.toThrow('Amount cannot be negative');
    });

    it('should have default status as PENDING', () => {
      const payment = new Payment(mockPayment);
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should prevent modification of transactionDate', async () => {
      const payment = new Payment(mockPayment);
      const savedPayment = await payment.save() as (IPayment & { _id: mongoose.Types.ObjectId });
      
      const originalDate = savedPayment.transactionDate;
      const modifiedPayment = await Payment.findById(savedPayment._id);
      
      if (modifiedPayment) {
        modifiedPayment.transactionDate = new Date('2000-01-01');
        await modifiedPayment.save();

        const finalPayment = await Payment.findById(savedPayment._id);
        expect(finalPayment?.transactionDate).toEqual(originalDate);
      } else {
        fail('Payment not found');
      }
    });
  });

  // Service Tests
  describe('Payment Services', () => {
    it('should create a payment', async () => {
      (createPayment as jest.Mock).mockResolvedValue(mockPayment);
      
      const result = await createPayment(mockPayment);
      expect(result).toEqual(mockPayment);
    });

    it('should get payment by ID', async () => {
      (getPaymentById as jest.Mock).mockResolvedValue(mockPayment);
      
      const result = await getPaymentById(mockPaymentId);
      expect(result).toEqual(mockPayment);
    });

    it('should get all payments', async () => {
      const mockPayments = [mockPayment, { ...mockPayment, amount: 200 }];
      (getAllPayments as jest.Mock).mockResolvedValue(mockPayments);
      
      const result = await getAllPayments();
      expect(result.length).toBe(2);
    });

    it('should update payment status', async () => {
      const updatedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };
      (updatePayment as jest.Mock).mockResolvedValue(updatedPayment);
      
      const result = await updatePayment(mockPaymentId, { status: PaymentStatus.COMPLETED });
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });
  });

  // Static Method Tests
  describe('Payment Model Static Methods', () => {
    it('should find payments by booking ID', async () => {
      const bookingId = new mongoose.Types.ObjectId();
      const payment1 = new Payment({ ...mockPayment, bookingId });
      const payment2 = new Payment({ ...mockPayment, bookingId });
      
      await payment1.save();
      await payment2.save();

      const payments = await Payment.findByBooking(bookingId);
      expect(payments.length).toBe(2);
    });

    it('should find payments by payer ID', async () => {
      const payerId = new mongoose.Types.ObjectId();
      const payment1 = new Payment({ ...mockPayment, payerId });
      const payment2 = new Payment({ ...mockPayment, payerId });
      
      await payment1.save();
      await payment2.save();

      const payments = await Payment.findByPayer(payerId);
      expect(payments.length).toBe(2);
    });
  });

  describe('Payment Delete Service', () => {
    it('should delete a payment successfully', async () => {
      // Create a payment first
      const payment = new Payment(mockPayment);
      const savedPayment = await payment.save() as (IPayment & { _id: mongoose.Types.ObjectId });

      // Use actual Mongoose deletion method
      const deleteResult = await Payment.deleteOne({ _id: savedPayment._id });

      // Verify delete result
      expect(deleteResult.deletedCount).toBe(1);

      // Verify payment is actually deleted from database
      const findDeletedPayment = await Payment.findById(savedPayment._id);
      expect(findDeletedPayment).toBeNull();
    });

    it('should handle delete of non-existent payment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      // Attempt to delete non-existent payment
      const deleteResult = await Payment.deleteOne({ _id: nonExistentId });

      // Verify delete result
      expect(deleteResult.deletedCount).toBe(0);
    });

    it('should work with service delete method', async () => {
      // Create a payment first
      const payment = new Payment(mockPayment);
      const savedPayment = await payment.save();

      // Mock the delete service to call actual deletion
      (deletePayment as jest.Mock).mockImplementation(async (id) => {
        return await Payment.deleteOne({ _id: id });
      });

      // Perform delete via mocked service
      const deleteResult = await deletePayment((savedPayment._id as mongoose.Types.ObjectId).toString());
      console.log(deleteResult);

      // Verify delete result
      expect(deleteResult.deletedCount).toBe(1);

      // Verify payment is actually deleted from database
      const findDeletedPayment = await Payment.findById(savedPayment._id);
      expect(findDeletedPayment).toBeNull();
    });
  });
});