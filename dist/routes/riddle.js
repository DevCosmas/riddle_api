"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createRiddle_1 = require("../controller/createRiddle");
const file_upload_1 = __importDefault(require("../global/file.upload"));
const authController_1 = require("../controller/authController");
const riddleRouter = express_1.default.Router();
// Route for retrieving the riddle action
riddleRouter.get('/action/get', createRiddle_1.getAction);
riddleRouter.post('/action/answer', (req, res, next) => {
    (0, createRiddle_1.answerRiddle)(req, res, next);
});
riddleRouter.get('/my_riddles', authController_1.isAuthenticated, createRiddle_1.viewMyRiddleChallenge);
riddleRouter.get('/my_riddles/:id', authController_1.isAuthenticated, createRiddle_1.viewOneChallenge);
riddleRouter.get('/ranking', authController_1.isAuthenticated, createRiddle_1.riddleRanking);
// Route for creating a new riddle
riddleRouter.post('/action/create', authController_1.isAuthenticated, file_upload_1.default, (req, res, next) => {
    (0, createRiddle_1.createRiddle)(req, res, next);
});
exports.default = riddleRouter;
