import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, models } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from 'src/common/enums/user.enum';
import { hashText } from 'src/common/utils/security/hash.utils';

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
    type: {
      otp: String,
      expireAt: Date,
    },
  })
  confirmEmailOTP: {
    otp: string;
    expireAt: Date;
  };

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
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashText({ text: this.password });
  }
  next();
});

export type UserDocument = HydratedDocument<User>;

export const userModel =
  models.User ||
  MongooseModule.forFeature([{ name: User.name, schema: userSchema }]);
