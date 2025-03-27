import { Request, Response, Router, NextFunction } from 'express';
import Payment, { IPayment, PaymentStatus } from '../models/payment.model';
import mongoose from 'mongoose';

// Define custom type for request body
interface CreatePaymentBody {
  bookingId: string;
  payerId: string;
  receiverId: string;
  amount: number;
}

// Define custom type for status update body
interface UpdateStatusBody {
  status: PaymentStatus;
}

class PaymentController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/', this.createPayment);
    this.router.get('/:id', this.getPaymentById);
    this.router.patch('/:id/status', this.updatePaymentStatus);
  }

  private async createPayment(
    req: Request<{}, {}, CreatePaymentBody>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookingId, payerId, receiverId, amount } = req.body;

      // Validate input
      if (!mongoose.Types.ObjectId.isValid(bookingId) || 
          !mongoose.Types.ObjectId.isValid(payerId) || 
          !mongoose.Types.ObjectId.isValid(receiverId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const newPayment = new Payment({
        bookingId: new mongoose.Types.ObjectId(bookingId),
        payerId: new mongoose.Types.ObjectId(payerId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        amount,
        status: PaymentStatus.PENDING
      });

      const savedPayment = await newPayment.save();
      res.status(201).json(savedPayment);
    } catch (error) {
      next(error);
    }
  }

  private async getPaymentById(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  private async updatePaymentStatus(
    req: Request<{ id: string }, {}, UpdateStatusBody>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.body;

      if (!Object.values(PaymentStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid payment status' });
        return;
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        req.params.id, 
        { status }, 
        { new: true, runValidators: true }
      );

      if (!updatedPayment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      res.json(updatedPayment);
    } catch (error) {
      next(error);
    }
  }

  // Getter method to access router
  getRouter() {
    return this.router;
  }
}

// Export router
const paymentController = new PaymentController();
export default paymentController.getRouter();