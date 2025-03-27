import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";
import payment_Router from "./payment.routes";
import bookingRoutes from "./booking.routes";
import notificationRouter from "./notification.router";
import messageRouter from "./message.routes";
import eventRoutes from "./eventRoutes";
import payemnt_Router from "./payment.routes";



const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  payment_Router(router);
  router.use("/bookings", bookingRoutes);
  notificationRouter(router)
  messageRouter(router);
  eventRoutes(router);
  payemnt_Router(router);
  return router;
};
