import express from 'express';

import authRouter from './auth.routes';

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  return router;
};
