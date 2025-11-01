import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { userModel } from 'src/DB/models/user.model';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [userModel],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
