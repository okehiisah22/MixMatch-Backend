import express from "express";

import authRouter from "./auth.routes";
import djProfile_Router from "./DjProfile.router";
import messageRouter from "./message.routes";

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  djProfile_Router(router);
  messageRouter(router);
  return router;
};
