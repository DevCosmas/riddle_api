import express, { Request, Response, NextFunction } from 'express';
import {
  createRiddle,
  getAction,
  answerRiddle,
  viewMyRiddleChallenge,
  viewOneChallenge,
  riddleRanking,
} from '../controller/createRiddle';
import uploadIcon from '../global/file.upload';
import { isAuthenticated } from '../controller/authController';
const riddleRouter = express.Router();

// Route for retrieving the riddle action
riddleRouter.get('/action/get', getAction);
riddleRouter.post(
  '/action/answer',
  (req: Request, res: Response, next: NextFunction) => {
    answerRiddle(req, res, next);
  }
);

riddleRouter.get('/my_riddles', isAuthenticated, viewMyRiddleChallenge);
riddleRouter.get('/my_riddles/:id', isAuthenticated, viewOneChallenge);
riddleRouter.get('/ranking', isAuthenticated, riddleRanking);

// Route for creating a new riddle
riddleRouter.post(
  '/action/create',
  isAuthenticated,
  uploadIcon,
  (req: Request, res: Response, next: NextFunction) => {
    createRiddle(req, res, next);
  }
);

export default riddleRouter;
