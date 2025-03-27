import { Request, Response } from "express";
import {
  createPayment,
  getPaymentById,
  getAllPayments,
  updatePayment,
  deletePayment,
} from "../services/payment.service";

// Helper function for handling responses
const handleServiceCall = async (res: Response, serviceCall: Promise<any>) => {
  try {
    const result = await serviceCall;
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json(error);
  }
};

// Create Payment
export const createPaymentController = async (req: Request, res: Response) => {
  await handleServiceCall(res, createPayment(req.body));
};

// Get Payment by ID
export const getPaymentByIdController = async (req: Request, res: Response) => {
  await handleServiceCall(res, getPaymentById(req.params.id));
};

// Get All Payments
export const getAllPaymentsController = async (_req: Request, res: Response) => {
  await handleServiceCall(res, getAllPayments());
};

// Update Payment
export const updatePaymentController = async (req: Request, res: Response) => {
  await handleServiceCall(res, updatePayment(req.params.id, req.body));
};

// Delete Payment
export const deletePaymentController = async (req: Request, res: Response) => {
  await handleServiceCall(res, deletePayment(req.params.id));
};
