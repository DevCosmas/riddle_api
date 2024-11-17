"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign_up_user = sign_up_user;
exports.login = login;
const app_error_1 = __importDefault(require("../global/app.error"));
const user_1 = __importDefault(require("../model/user"));
const jwt_1 = __importDefault(require("../utils/jwt"));
function sign_up_user(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password, confirmPassword, username } = req.body;
            // Check if required fields are provided
            if (!email || !password || !confirmPassword) {
                return next(new app_error_1.default('Please provide email, password, and confirm password', 400));
            }
            console.log(password, confirmPassword);
            // Check if password and confirmPassword match
            if (password !== confirmPassword) {
                return next(new app_error_1.default('Password and confirm password do not match', 400));
            }
            // Create a new user
            const newUser = yield user_1.default.create({
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
        }
        catch (error) {
            next(new app_error_1.default(error, 500));
        }
    });
}
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email && password)
                return next(new app_error_1.default('Provide email and password', 400));
            const user = yield user_1.default.findOne({ email });
            if (!user)
                return next(new app_error_1.default('no user record', 400));
            const isValidPassword = yield user.isValidPassword(password);
            if (!isValidPassword)
                return next(new app_error_1.default('Incorrect password', 401));
            const token = yield (0, jwt_1.default)(user._id);
            user.password = undefined;
            res.status(200).json({
                status: 'success',
                message: 'login successful',
                data: {
                    access_token: token,
                    user,
                },
            });
        }
        catch (error) {
            next(new app_error_1.default(error, 500));
        }
    });
}
