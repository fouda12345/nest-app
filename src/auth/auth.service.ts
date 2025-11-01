import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SignupDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/DB/models/user.model';
import { Model } from 'mongoose';
import { ConfirmEmailDto } from './dto/confirmEmail.dto';
import { compareText } from 'src/common/utils/security/hash.utils';
import { LoginDto } from './dto/login.dto';
import { ProviderEnum } from 'src/common/enums/user.enum';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import id from 'zod/v4/locales/id.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}
  async signup(signupDTO: SignupDto) {
    const checkUser = await this.userModel.findOne({
      $or: [
        { email: signupDTO.email },
        signupDTO.phoneNumber
          ? { phoneNumber: signupDTO.phoneNumber }
          : { email: signupDTO.email },
      ],
    });
    if (checkUser) throw new ConflictException('User already exists');
    const [user] = (await this.userModel.create([signupDTO])) || [];
    if (!user)
      throw new ServiceUnavailableException('User registration failed');
    return { message: 'User registered successfully', data: { user } };
  }

  async confirmEmail({ email, otp }: ConfirmEmailDto) {
    const user = await this.userModel.findOne({
      email,
      confirmEmail: { $exists: false },
      'confirmEmailOTP.otp': { $exists: true },
      'confirmEmailOTP.expireAt': { $gt: new Date() },
    });

    if (!user) throw new BadRequestException('Invalid request');
    if (!(await compareText({ text: otp, hash: user.confirmEmailOTP.otp })))
      throw new BadRequestException('Invalid OTP or OTP has expired');
    await user.updateOne({
      $unset: { confirmEmailOTP: 1 },
      $set: { confirmEmail: new Date() },
    });
    await user.save();
    return { message: 'Email confirmed successfully' };
  }

  async resendOTP(email: string) {
    const user = await this.userModel.findOne({
      email,
      confirmEmail: { $exists: false },
    });
    if (!user) throw new NotFoundException('user not found');
    await user.generateConfirmEmailOTP();
    await user.save();
    return { message: 'OTP resent successfully' };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userModel.findOne({
      email,
      confirmEmail: { $exists: true },
      privider: ProviderEnum.LOCAL,
    });
    if (!user) throw new NotFoundException('User not found');
    const isPasswordValid = await compareText({
      text: password,
      hash: user.password,
    });
    if (!isPasswordValid) throw new BadRequestException('Invalid credentials');

    const jwtid = randomUUID();
    const accessToken = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN) || 3600,
        jwtid,
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) || 86400,
        jwtid,
      },
    );

    return {
      message: 'Login successful',
      data: { credentials: { accessToken, refreshToken } },
    };
  }
}
