import express from 'express';
import { login, sign_up_user } from '../controller/user';

const userRouter = express.Router();

userRouter.post('/signup', sign_up_user);
userRouter.post('/login', login);

export default userRouter;
