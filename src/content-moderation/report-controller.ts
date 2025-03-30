import type { Request, Response } from "express"
import { ReportStatus, type ReportFilterOptions, ActionType } from "../types"
import { ReportService } from "../services/report-service"
import { CapsuleService } from "../services/capsule-service"
import { UserService } from "../services/user-service"

export class ReportController {
  private reportService: ReportService
  private capsuleService: CapsuleService
  private userService: UserService

  constructor() {
    this.reportService = new ReportService()
    this.capsuleService = new CapsuleService()
    this.userService = new UserService()
  }

  /**
   * Get all reports with optional filtering
   */
  public getReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: ReportFilterOptions = {
        status: req.query.status as ReportStatus,
        reason: req.query.reason as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? Number.parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Number.parseInt(req.query.limit as string) : 10,
      }

      const reports = await this.reportService.getReports(filters)
      const total = await this.reportService.countReports(filters)

      res.status(200).json({
        reports,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total,
        },
      })
    } catch (error) {
      console.error("Error fetching reports:", error)
      res.status(500).json({ message: "Failed to fetch reports" })
    }
  }

  /**
   * Get a single report by ID with related capsule and reporter details
   */
  public getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportId = req.params.id
      const report = await this.reportService.getReportById(reportId)

      if (!report) {
        res.status(404).json({ message: "Report not found" })
        return
      }

      // Get capsule and reporter details
      const capsule = await this.capsuleService.getCapsuleById(report.capsuleId)
      const reporter = await this.userService.getUserById(report.reporterId)
      const capsuleOwner = capsule ? await this.userService.getUserById(capsule.userId) : null

      // Get previous actions taken on this report
      const actions = await this.reportService.getActionsByReportId(reportId)

      res.status(200).json({
        report,
        capsule,
        reporter: {
          id: reporter?.id,
          username: reporter?.username,
        },
        capsuleOwner: capsuleOwner
          ? {
              id: capsuleOwner.id,
              username: capsuleOwner.username,
            }
          : null,
        actions,
      })
    } catch (error) {
      console.error("Error fetching report details:", error)
      res.status(500).json({ message: "Failed to fetch report details" })
    }
  }

  /**
   * Take action on a reported capsule
   */
  public takeAction = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportId = req.params.id
      const { actionType, notes, duration } = req.body
      const adminId = req.user?.userId

      if (!adminId) {
        res.status(401).json({ message: "Unauthorized" })
        return
      }

      // Validate action type
      if (!Object.values(ActionType).includes(actionType)) {
        res.status(400).json({ message: "Invalid action type" })
        return
      }

      // Get the report
      const report = await this.reportService.getReportById(reportId)
      if (!report) {
        res.status(404).json({ message: "Report not found" })
        return
      }

      // Get the capsule
      const capsule = await this.capsuleService.getCapsuleById(report.capsuleId)
      if (!capsule) {
        res.status(404).json({ message: "Capsule not found" })
        return
      }

      // Create action record
      const action = await this.reportService.createAction({
        reportId,
        adminId,
        type: actionType,
        notes,
        duration: duration || undefined,
        createdAt: new Date(),
      })

      // Perform the action on the capsule/user
      switch (actionType) {
        case ActionType.WARNING:
          await this.userService.warnUser(capsule.userId, notes || "Your capsule has been flagged for review")
          break
        case ActionType.MUTE:
          await this.userService.muteUser(capsule.userId, duration || 7) // Default 7 days
          break
        case ActionType.SUSPEND:
          await this.userService.suspendUser(capsule.userId, duration || 30) // Default 30 days
          break
        case ActionType.DELETE:
          await this.capsuleService.deleteCapsule(capsule.id)
          break
        default:
          // No action needed
          break
      }

      // Update report status to reviewed
      await this.reportService.updateReportStatus(reportId, ReportStatus.REVIEWED)

      res.status(200).json({
        message: "Action taken successfully",
        action,
      })
    } catch (error) {
      console.error("Error taking action on report:", error)
      res.status(500).json({ message: "Failed to take action on report" })
    }
  }

  /**
   * Dismiss a report without taking action
   */
  public dismissReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportId = req.params.id
      const { notes } = req.body
      const adminId = req.user?.userId

      if (!adminId) {
        res.status(401).json({ message: "Unauthorized" })
        return
      }

      // Get the report
      const report = await this.reportService.getReportById(reportId)
      if (!report) {
        res.status(404).json({ message: "Report not found" })
        return
      }

      // Create action record for dismissal
      await this.reportService.createAction({
        reportId,
        adminId,
        type: ActionType.NONE,
        notes: notes || "Report dismissed",
        createdAt: new Date(),
      })

      // Update report status to dismissed
      await this.reportService.updateReportStatus(reportId, ReportStatus.DISMISSED)

      res.status(200).json({
        message: "Report dismissed successfully",
      })
    } catch (error) {
      console.error("Error dismissing report:", error)
      res.status(500).json({ message: "Failed to dismiss report" })
    }
  }

  /**
   * Get report statistics
   */
  public getReportStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.reportService.getReportStatistics()
      res.status(200).json(stats)
    } catch (error) {
      console.error("Error fetching report statistics:", error)
      res.status(500).json({ message: "Failed to fetch report statistics" })
    }
  }
}

