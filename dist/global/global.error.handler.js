"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_error_1 = __importDefault(require("./app.error"));
const handleTokenExpire = (res) => {
    return new app_error_1.default('kindly login again', 400);
};
const handleCastError = (err) => {
    const value = err.error.value;
    const message = `${value} is an Invalid Input`;
    return new app_error_1.default(message, 400);
};
const handleDuplicateFields = (err) => {
    const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    const refinedValue = value.split('"')[1];
    const message = `${refinedValue} is already taken`;
    return new app_error_1.default(message, 400);
};
const handleValidatorError = (err) => {
    const message = err.message.split(':')[2];
    return new app_error_1.default(message, 400);
};
const handleJwtError = (err) => {
    const message = err.error.message;
    return new app_error_1.default(message, 400);
};
const sendErrorDev = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack,
        error,
    });
};
const sendErrorProd = (error, res) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
    else {
        console.error(error);
        res
            .status(500)
            .json({ status: 'error', message: 'Unexpected Error occurred' });
    }
};
const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let err = Object.assign({}, error);
        err.message = error.message;
        if (error.error.name === 'CastError')
            err = handleCastError(error);
        if (error.error.code === 11000)
            err = handleDuplicateFields(error);
        if (error.error.name === 'ValidationError')
            err = handleValidatorError(error);
        if (error.error.name === 'JsonWebTokenError')
            err = handleJwtError(error);
        if (error.error.name === 'TokenExpiredError')
            err = handleTokenExpire(res);
        sendErrorProd(err, res);
    }
    next();
};
exports.default = errorHandler;
