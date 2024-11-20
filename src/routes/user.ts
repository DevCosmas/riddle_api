import express from 'express';
import { login, sign_up_user, updateUser } from '../controller/user';
import { isAuthenticated } from '../controller/authController';

const userRouter = express.Router();

userRouter.post('/signup', sign_up_user);
userRouter.post('/login', login);
userRouter.patch('/update', isAuthenticated, updateUser);

export default userRouter;
