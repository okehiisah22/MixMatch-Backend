import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";
import eventRoutes from "./eventRoutes";

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  router.use("/events", eventRoutes);
  return router;
};
