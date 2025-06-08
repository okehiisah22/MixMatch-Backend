import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import type { RefreshTokenDto } from "./dto/refresh-token.dto"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto)
  }
}
