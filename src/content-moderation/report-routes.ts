import express from "express"
import { adminAuthMiddleware } from "../middleware/admin-auth"
import { ReportController } from "../controllers/report-controller"

const router = express.Router()
const reportController = new ReportController()

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware)

// Report routes
router.get("/reports", reportController.getReports)
router.get("/reports/stats", reportController.getReportStats)
router.get("/reports/:id", reportController.getReportById)
router.post("/reports/:id/action", reportController.takeAction)
router.post("/reports/:id/dismiss", reportController.dismissReport)

export default router

