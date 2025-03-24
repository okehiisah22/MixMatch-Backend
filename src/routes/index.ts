import express from "express"

import authRouter from "./auth.routes"
import protectedRouter from "./protected.routes"
import userRouter from "./user.routes"

const router = express.Router()
export default (): express.Router => {
  authRouter(router)
  protectedRouter(router)
  userRouter(router)
  return router
}

