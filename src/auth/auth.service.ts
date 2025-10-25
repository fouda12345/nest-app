import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SignupDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/DB/models/user.model';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
}
