import type { MusicProvider } from "@prisma/client"

export class User {
  id: string
  email?: string
  displayName: string
  musicProvider: MusicProvider
  musicId: string
  accessToken: string
  refreshToken: string
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }

  // Method to get user without sensitive data
  toPublic() {
    const { accessToken, refreshToken, ...publicUser } = this
    return publicUser
  }
}
