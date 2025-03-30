import type { Report, ReportStatus, ReportFilterOptions, Action } from "../types"
import { db } from "../config/database"

export class ReportService {
  /**
   * Get reports with optional filtering
   */
  public async getReports(filters: ReportFilterOptions): Promise<Report[]> {
    try {
      const { status, reason, startDate, endDate, page = 1, limit = 10 } = filters
      const offset = (page - 1) * limit

      // Build query conditions
      const conditions = []
      const params: any[] = []
      let paramIndex = 1

      if (status) {
        conditions.push(`status = $${paramIndex++}`)
        params.push(status)
      }

      if (reason) {
        conditions.push(`reason = $${paramIndex++}`)
        params.push(reason)
      }

      if (startDate) {
        conditions.push(`created_at >= $${paramIndex++}`)
        params.push(startDate)
      }

      if (endDate) {
        conditions.push(`created_at <= $${paramIndex++}`)
        params.push(endDate)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

      // Execute query
      const query = `
        SELECT * FROM reports
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `
      params.push(limit, offset)

      const result = await db.query(query, params)
      return result.rows.map(this.mapReportFromDb)
    } catch (error) {
      console.error("Error in getReports:", error)
      throw error
    }
  }

  /**
   * Count total reports matching filters
   */
  public async countReports(filters: ReportFilterOptions): Promise<number> {
    try {
      const { status, reason, startDate, endDate } = filters

      // Build query conditions
      const conditions = []
      const params: any[] = []
      let paramIndex = 1

      if (status) {
        conditions.push(`status = $${paramIndex++}`)
        params.push(status)
      }

      if (reason) {
        conditions.push(`reason = $${paramIndex++}`)
        params.push(reason)
      }

      if (startDate) {
        conditions.push(`created_at >= $${paramIndex++}`)
        params.push(startDate)
      }

      if (endDate) {
        conditions.push(`created_at <= $${paramIndex++}`)
        params.push(endDate)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

      // Execute query
      const query = `
        SELECT COUNT(*) as total FROM reports
        ${whereClause}
      `

      const result = await db.query(query, params)
      return Number.parseInt(result.rows[0].total)
    } catch (error) {
      console.error("Error in countReports:", error)
      throw error
    }
  }

  /**
   * Get a single report by ID
   */
  public async getReportById(id: string): Promise<Report | null> {
    try {
      const query = "SELECT * FROM reports WHERE id = $1"
      const result = await db.query(query, [id])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapReportFromDb(result.rows[0])
    } catch (error) {
      console.error("Error in getReportById:", error)
      throw error
    }
  }

  /**
   * Update report status
   */
  public async updateReportStatus(id: string, status: ReportStatus): Promise<void> {
    try {
      const query = "UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2"
      await db.query(query, [status, id])
    } catch (error) {
      console.error("Error in updateReportStatus:", error)
      throw error
    }
  }

  /**
   * Create an action record
   */
  public async createAction(action: Omit<Action, "id">): Promise<Action> {
    try {
      const { reportId, adminId, type, notes, duration, createdAt } = action

      const query = `
        INSERT INTO actions (report_id, admin_id, type, notes, duration, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `

      const result = await db.query(query, [reportId, adminId, type, notes, duration, createdAt])
      return this.mapActionFromDb(result.rows[0])
    } catch (error) {
      console.error("Error in createAction:", error)
      throw error
    }
  }

  /**
   * Get actions for a report
   */
  public async getActionsByReportId(reportId: string): Promise<Action[]> {
    try {
      const query = `
        SELECT * FROM actions
        WHERE report_id = $1
        ORDER BY created_at DESC
      `

      const result = await db.query(query, [reportId])
      return result.rows.map(this.mapActionFromDb)
    } catch (error) {
      console.error("Error in getActionsByReportId:", error)
      throw error
    }
  }

  /**
   * Get report statistics
   */
  public async getReportStatistics() {
    try {
      // Get counts by status
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM reports
        GROUP BY status
      `
      const statusResult = await db.query(statusQuery)

      // Get counts by reason
      const reasonQuery = `
        SELECT reason, COUNT(*) as count
        FROM reports
        GROUP BY reason
      `
      const reasonResult = await db.query(reasonQuery)

      // Get counts by day for the last 30 days
      const timelineQuery = `
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM reports
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `
      const timelineResult = await db.query(timelineQuery)

      // Get action type distribution
      const actionsQuery = `
        SELECT type, COUNT(*) as count
        FROM actions
        GROUP BY type
      `
      const actionsResult = await db.query(actionsQuery)

      return {
        byStatus: statusResult.rows,
        byReason: reasonResult.rows,
        timeline: timelineResult.rows,
        actions: actionsResult.rows,
        total: await this.countReports({}),
      }
    } catch (error) {
      console.error("Error in getReportStatistics:", error)
      throw error
    }
  }

  /**
   * Map database row to Report object
   */
  private mapReportFromDb(row: any): Report {
    return {
      id: row.id,
      capsuleId: row.capsule_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      description: row.description,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  /**
   * Map database row to Action object
   */
  private mapActionFromDb(row: any): Action {
    return {
      id: row.id,
      reportId: row.report_id,
      adminId: row.admin_id,
      type: row.type,
      notes: row.notes,
      duration: row.duration,
      createdAt: new Date(row.created_at),
    }
  }
}

