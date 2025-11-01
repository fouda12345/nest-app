import { BadRequestException } from '@nestjs/common';
import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, models } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from 'src/common/enums/user.enum';
import { emailEvent } from 'src/common/events/sendEmail.event';
import { hashText } from 'src/common/utils/security/hash.utils';
import { generateOTP } from 'src/common/utils/security/otp.utils';

@Schema()
export class Otp {
  @Prop({
    type: String,
    required: true,
  })
  otp: string;
  @Prop({
    type: Date,
    required: true,
  })
  expireAt: Date;
  @Prop({
    type: Date,
    required: true,
  })
  createdAt: Date;
}
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 25,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 25,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    },
    set: function (name: string) {
      const [firstName, lastName] = name.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  fullName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: Date,
  })
  confirmEmail: Date;

  @Prop({
    type: Otp,
  })
  confirmEmailOTP: Otp;

  @Prop({
    type: String,
    required: function () {
      return this.provider === ProviderEnum.LOCAL;
    },
  })
  password: string;

  @Prop({
    type: String,
    trim: true,
    sparse: true,
  })
  phoneNumber: string;

  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.MALE,
  })
  gender: string;

  @Prop({
    type: Date,
  })
  DOB: Date;

  @Virtual({
    get: function () {
      const today = new Date();
      let age = new Date().getFullYear() - this.DOB.getFullYear();
      if (
        today.getMonth() < this.DOB.getMonth() ||
        (today.getMonth() === this.DOB.getMonth() &&
          today.getDate() < this.DOB.getDate())
      ) {
        age--;
      }
      return age;
    },
  })
  age: number;

  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: string;

  @Prop({
    type: String,
    enum: ProviderEnum,
    default: ProviderEnum.LOCAL,
  })
  privider: string;

  generateConfirmEmailOTP: () => Promise<void>;
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.methods.generateConfirmEmailOTP = async function () {
  if (this.confirmEmailOTP?.createdAt > new Date(Date.now() - 1 * 60 * 1000))
    throw new BadRequestException(
      'OTP request too frequent. Please try again later.',
    );
  const otp = generateOTP();
  this.confirmEmailOTP = {
    otp,
    expireAt: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
  };
  emailEvent.emit('confirmEmail', {
    to: this.email,
    otp,
    name: this.fullName,
  });
};
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.generateConfirmEmailOTP();
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashText({ text: this.password });
  }
  if (this.isModified('confirmEmailOTP')) {
    this.confirmEmailOTP.otp = await hashText({
      text: this.confirmEmailOTP.otp,
    });
  }
  next();
});

export type UserDocument = HydratedDocument<User>;

export const userModel =
  models.User ||
  MongooseModule.forFeature([{ name: User.name, schema: userSchema }]);
