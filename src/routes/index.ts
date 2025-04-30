import express from "express"
import swipeRoutes from "./swipe.routes"
import matchRoutes from "./match.routes"

const router = express.Router()

export default (): express.Router => {
  // Add swipe routes
  router.use("/swipe", swipeRoutes)
  router.use("/matches", matchRoutes)

  return router
}
