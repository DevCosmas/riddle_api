import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import AppError from '../global/app.error';

export interface UserDocument extends Document {
  email: string;
  username?: string;
  password: string | any;
  profile_image?: string;
  resetPasswordToken?: string;
  resetTimeExp?: Date;

  isValidPassword(candidatePassword: string): Promise<boolean>;
  createResetToken(): Promise<string>;
}

const userSchema = new Schema<UserDocument>({
  profile_image: { type: String },

  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  username: { type: String },

  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
  },
  resetPasswordToken: { type: String },
  resetTimeExp: { type: Date },
});

// Hash password before saving if modified
userSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isValidPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createResetToken = async function (): Promise<string> {
  const resetToken = Math.floor(Math.random() * 30000) + 1;
  const resetTokenStr = resetToken.toString();
  this.resetPasswordToken = resetTokenStr;
  this.resetTimeExp = new Date(Date.now() + 10 * 60 * 1000);
  return resetTokenStr;
};

const userModel: Model<UserDocument> = mongoose.model<UserDocument>(
  'User',
  userSchema
);

export default userModel;
