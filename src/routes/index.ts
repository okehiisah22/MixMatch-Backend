import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  return router;
};
