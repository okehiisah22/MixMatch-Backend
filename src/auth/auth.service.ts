import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateTokens(userId: string, provider: string) {
    const payload = { userId, provider }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "1h",
      secret: this.configService.get<string>("JWT_SECRET"),
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "7d",
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      })

      return this.generateTokens(payload.userId, payload.provider)
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token")
    }
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      })
    } catch (error) {
      throw new UnauthorizedException("Invalid token")
    }
  }
}
