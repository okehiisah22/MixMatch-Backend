import express from "express";
import {
  createPaymentController,
  getPaymentByIdController,
  getAllPaymentsController,
  updatePaymentController,
  deletePaymentController,
} from "../controllers/payment.controller";
const payment_Router = (router: express.Router) => {
  router.post("/payment/create", createPaymentController);
  router.get("/payment", getAllPaymentsController);
  router.get("/payment/:id", getPaymentByIdController);
  router.put("/payment/:id", updatePaymentController);
  router.delete("/payment/:id", deletePaymentController);
};

export default payment_Router;

