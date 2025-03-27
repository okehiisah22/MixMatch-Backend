import express, { Router } from "express";
import paymentRoutes from '../controllers/payment.controller';

const payemnt_Router = (router: express.Router) => {
  router.post("/api/payments", paymentRoutes);
};

export default payemnt_Router;
