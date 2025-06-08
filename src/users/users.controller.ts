import { Controller, Get, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { Public } from "../decorators/public.decorator"
import type { Request } from "express"

@Controller("users")
export class UsersController {
  @Public()
  @Get("public")
  getPublicData() {
    return { message: "This is public data" }
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(req: Request) {
    return {
      userId: req.user.userId,
      provider: req.user.provider,
    }
  }
}
