import type { Capsule } from "../types"
import { db } from "../config/database"

export class CapsuleService {
  /**
   * Get a capsule by ID
   */
  public async getCapsuleById(id: string): Promise<Capsule | null> {
    try {
      const query = "SELECT * FROM capsules WHERE id = $1"
      const result = await db.query(query, [id])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapCapsuleFromDb(result.rows[0])
    } catch (error) {
      console.error("Error in getCapsuleById:", error)
      throw error
    }
  }

  /**
   * Delete a capsule
   */
  public async deleteCapsule(id: string): Promise<void> {
    try {
      const query = "UPDATE capsules SET status = $1 WHERE id = $2"
      await db.query(query, ["deleted", id])
    } catch (error) {
      console.error("Error in deleteCapsule:", error)
      throw error
    }
  }

  /**
   * Map database row to Capsule object
   */
  private mapCapsuleFromDb(row: any): Capsule {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      status: row.status,
      createdAt: new Date(row.created_at),
      unlockAt: new Date(row.unlock_at),
    }
  }
}

