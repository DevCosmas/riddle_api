"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_CONNECTION_URL = process.env
    .MONGODB_CONNECTION_URI;
const mongoDbConnection = () => {
    mongoose_1.default.connect(MONGODB_CONNECTION_URL);
    mongoose_1.default.connection.on('connected', () => {
        console.log('Database connected successfully');
    });
    mongoose_1.default.connection.on('error', (err) => {
        console.log(`An error has occurred: ${err}`);
    });
};
exports.default = mongoDbConnection;
