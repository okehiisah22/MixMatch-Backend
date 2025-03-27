import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";
import payment_Router from "./payment.routes";
import bookingRoutes from "./booking.routes";
import notificationRouter from "./notification.router";
import messageRouter from "./message.routes";
import eventRoutes from "./eventRoutes";


const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  payment_Router(router);
  router.use("/bookings", bookingRoutes);
  notificationRouter(router)
  messageRouter(router);
  router.use("/events", eventRoutes);
  return router;
};
