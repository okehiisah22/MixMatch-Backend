import { db } from "../config/database"

export class UserService {
  /**
   * Get a user by ID
   */
  public async getUserById(id: string): Promise<any | null> {
    try {
      const query = "SELECT id, username, email, role, status FROM users WHERE id = $1"
      const result = await db.query(query, [id])

      if (result.rows.length === 0) {
        return null
      }

      return result.rows[0]
    } catch (error) {
      console.error("Error in getUserById:", error)
      throw error
    }
  }

  /**
   * Send a warning to a user
   */
  public async warnUser(userId: string, message: string): Promise<void> {
    try {
      // Create a notification for the user
      const query = `
        INSERT INTO notifications (user_id, type, message, read, created_at)
        VALUES ($1, 'warning', $2, false, NOW())
      `
      await db.query(query, [userId, message])
    } catch (error) {
      console.error("Error in warnUser:", error)
      throw error
    }
  }

  /**
   * Mute a user for a specified duration
   */
  public async muteUser(userId: string, days: number): Promise<void> {
    try {
      const query = `
        UPDATE users
        SET status = 'muted', muted_until = NOW() + INTERVAL '${days} days'
        WHERE id = $1
      `
      await db.query(query, [userId])
    } catch (error) {
      console.error("Error in muteUser:", error)
      throw error
    }
  }

  /**
   * Suspend a user for a specified duration
   */
  public async suspendUser(userId: string, days: number): Promise<void> {
    try {
      const query = `
        UPDATE users
        SET status = 'suspended', suspended_until = NOW() + INTERVAL '${days} days'
        WHERE id = $1
      `
      await db.query(query, [userId])
    } catch (error) {
      console.error("Error in suspendUser:", error)
      throw error
    }
  }
}

