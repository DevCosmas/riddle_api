import { Request, Response, NextFunction } from 'express';
import AppError from '../global/app.error';
import userModel, { UserDocument } from '../model/user';
import jwtToken from '../utils/jwt';

export async function sign_up_user(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, confirmPassword, username } = req.body;

    // Check if required fields are provided
    if (!email || !password || !confirmPassword) {
      return next(
        new AppError(
          'Please provide email, password, and confirm password',
          400
        )
      );
    }

    console.log(password, confirmPassword);

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return next(
        new AppError('Password and confirm password do not match', 400)
      );
    }

    // Create a new user
    const newUser: UserDocument = await userModel.create({
      email,
      password,
      confirmPassword,
      username,
    });

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'Sign up is Successful',
      data: newUser,
    });
  } catch (error: any) {
    next(new AppError(error, 500));
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email && password)
      return next(new AppError('Provide email and password', 400));
    const user = await userModel.findOne({ email });

    if (!user) return next(new AppError('no user record', 400));

    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) return next(new AppError('Incorrect password', 401));

    const token = await jwtToken(user._id);

    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'login successful',
      data: {
        access_token: token,
        user,
      },
    });
  } catch (error: any) {
    next(new AppError(error, 500));
  }
}
