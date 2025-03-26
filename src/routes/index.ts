import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";
import payemnt_Router from "./payment.routes";


const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  payemnt_Router(router);
  return router;
};
