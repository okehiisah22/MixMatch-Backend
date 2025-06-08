import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common"
import type { AuthService } from "./auth.service"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: any) {
    const refreshToken = body.refreshToken;
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { userId: string; provider: string }) {
    return this.authService.generateTokens(loginDto.userId, loginDto.provider);
  }
}
