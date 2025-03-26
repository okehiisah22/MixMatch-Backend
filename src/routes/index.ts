import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";
import bookingRoutes from "./booking.routes";

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  router.use("/bookings", bookingRoutes);
  return router;
};
