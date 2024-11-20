"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controller/user");
const authController_1 = require("../controller/authController");
const userRouter = express_1.default.Router();
userRouter.post('/signup', user_1.sign_up_user);
userRouter.post('/login', user_1.login);
userRouter.patch('/update', authController_1.isAuthenticated, user_1.updateUser);
exports.default = userRouter;
