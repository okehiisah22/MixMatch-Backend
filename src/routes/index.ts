import express from "express"
import swipeRoutes from "./swipe.routes"

const router = express.Router()

export default (): express.Router => {
  // Add swipe routes
  router.use("/swipe", swipeRoutes)

  return router
}
