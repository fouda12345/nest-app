import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.pipe';
import { type SignupDto, signupSchema } from './dto/signup.dto';
import { sign } from 'crypto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) signupDTO: SignupDto,
  ) {
    return await this.authService.signup(signupDTO);
  }
}
