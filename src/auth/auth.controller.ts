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
import {
  type ConfirmEmailDto,
  confirmEmailSchema,
  resendEmailOTPSchema,
} from './dto/confirmEmail.dto';
import { type LoginDto, loginSchema } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) signupDTO: SignupDto,
  ) {
    return await this.authService.signup(signupDTO);
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body(new ZodValidationPipe(confirmEmailSchema))
    confirmEmailDto: ConfirmEmailDto,
  ) {
    return await this.authService.confirmEmail(confirmEmailDto);
  }

  @Post('resend-email-otp')
  async resendOTP(
    @Body(new ZodValidationPipe(resendEmailOTPSchema))
    { email }: { email: string },
  ) {
    return await this.authService.resendOTP(email);
  }

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
