import { Request, Response, NextFunction } from 'express';
import riddleModel, { IAnswers, IRiddle } from '../model/riddle';
import AppError from '../global/app.error';
import {
  ActionGetRequest,
  ActionGetResponse,
  createPostResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';

import {
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';

import measureTimeUntilCondition, { totalElapsedTime } from '../lib/timer';
import isChallengeElapsed from '../lib/calc_duration';
import userModel from '../model/user';

export async function getAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.query;

    if (!id) {
      return next(new AppError('Riddle ID is required', 400));
    }

    // Retrieve the riddle from the database
    const riddle = await riddleModel.findById(id);
    if (!riddle) {
      return next(new AppError('Riddle not found', 404));
    }
    const isGameDue = isChallengeElapsed(riddle);
    console.log(isGameDue);

    const iconURL = new URL(
      `/icons/${riddle.icon}`,
      `${req.protocol}://${req.get('host')}`
    ).toString();

    const payload: ActionGetResponse = {
      icon: iconURL,
      description: riddle.description,
      label: 'Solve me',
      links: {
        actions: [
          {
            href: `/api/riddle/action/answer?id=${riddle._id}&post=${riddle.options[0]}`,
            label: riddle.options[0],
            type: 'message',
          },
          {
            href: `/api/riddle/action/answer?id=${riddle._id}&post=${riddle.options[1]}`,
            label: riddle.options[1],
            type: 'message',
          },
          {
            href: `/api/riddle/action/answer?id=${riddle._id}&post=${riddle.options[2]}`,
            label: riddle.options[2],
            type: 'message',
          },
          {
            href: `/api/riddle/action/answer?id=${riddle._id}&post=${riddle.options[3]}`,
            label: riddle.options[3],
            type: 'message',
          },
        ],
      },
      title: riddle.question + '?',
      error: {
        message: 'action has not be implemented yet',
      },
      disabled: isGameDue,
    };

    // Set CORS headers for the response
    Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Send the payload as JSON response
    res.status(200).json(payload);
  } catch (error) {
    next(new AppError((error as Error).message, 500));
  }
}

export async function createRiddle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userModel.findById((req as any).user._id);
    if (!user) return next(new AppError('You need to register', 400));
    try {
      const { question, answer, wager, options, duration, description } =
        req.body;

      const parsedDurationJSON = JSON.parse(duration);
      parsedDurationJSON.value = parseInt(parsedDurationJSON.value);

      console.log(req.file);

      console.log(parsedDurationJSON, typeof parsedDurationJSON);
      const inputData = {
        question,
        answer,
        options,
        wager: parseFloat(wager),
        icon: req.file?.filename || req.body.icon,
        description,
        duration: parsedDurationJSON,
        user: (req as any).user._id,
      };
      console.log(inputData);

      // Check if each required field is provided
      if (!question || !answer || !wager) {
        return next(
          new AppError('Question, Answer, and Wager cannot be blank', 400)
        );
      }

      // Create and save the new riddle
      const newRiddle = await riddleModel.create(inputData);
      const blink: string = `${req.protocol}://${req.get(
        'host'
      )}/api/riddle/action/get?id=${newRiddle._id}`;

      newRiddle.blink = blink;

      await newRiddle.save();
      // Send response
      return res.status(201).json({
        status: true,
        message: 'Your riddle has been created',
        data: newRiddle,
      });
    } catch (error: any) {
      next(new AppError(error, 500));
    }
  } catch (error: any) {
    next(new AppError(error, 500));
  }
}

export async function answerRiddle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let shouldStopTimer = false;
    // await measureTimeUntilCondition(() => shouldStopTimer);

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const { id, post } = req.query;
    const body = req.body;

    // await measureTimeUntilCondition(() => shouldStopTimer);

    const riddle = await riddleModel.findById(id);

    console.log(riddle);

    const isGameDue = isChallengeElapsed(riddle as IRiddle);
    if (!riddle) {
      return next(new AppError('Riddle does not exist', 400));
    }

    // check if game duration is over, update riddle status to completed
    if (isGameDue) {
      riddle.status = 'completed';
      await riddle.save();
      return next(new AppError('Riddle Challenge is over', 400));
    }

    if (riddle.answer === post) {
      const answerObj: IAnswers = {
        walletAddress: body.account,
        timeCount: totalElapsedTime,
        isCorrect: true,
        answer: post,
      };
      shouldStopTimer = true;
      await measureTimeUntilCondition(() => shouldStopTimer);

      // Prepare unsigned transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(body.account),
          toPubkey: new PublicKey(process.env.WALLET_ADDRESS as string),
          lamports: 0.1 * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = new PublicKey(body.account);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction,
          message: 'You got the correct answer',
          type: 'transaction',
        },
      });
      riddle.answers.push(answerObj);
      await riddle.save();

      // const balance = await connection.getBalance(
      //   new PublicKey(process.env.WALLET_ADDRESS as string)
      // );
      // console.log(balance, 'WALLET BAL');

      // Set CORS headers for the response
      Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.status(200).json(payload);
    } else {
      res.status(400).json({ message: 'Your answer is wrong, try again' });
    }
  } catch (error: any) {
    next(new AppError(error.message || 'Server error', 500));
  }
}

export async function viewMyRiddleChallenge(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Find riddles, sort by isAnswered (ongoing at top), apply pagination
    const find_riddle = await riddleModel
      .find({ user: (req as any).user._id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    if (!find_riddle.length)
      return next(new AppError('No riddle challenge created yet', 400));

    res.status(200).json({
      status: 'success',
      page,
      limit,
      size: find_riddle.length,
      message: 'List of riddle challenges',
      data: find_riddle,
    });
  } catch (error: any) {
    next(new AppError(error, 500));
  }
}

export async function riddleRanking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find riddles with pagination and sorting by isAnswered status
    const find_riddle = await riddleModel
      .find({ user: (req as any).user._id, status: 'ongoing' })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for faster, non-hydrated documents

    if (!find_riddle.length)
      return next(new AppError('No riddle challenge created yet', 400));

    // Sort each riddle's answers array by timeCount in ascending order
    const sortedRiddles = find_riddle.map((riddle) => ({
      ...riddle,
      answers: riddle.answers.sort((a, b) => a.timeCount - b.timeCount),
    }));

    res.status(200).json({
      status: 'success',
      page,
      limit,
      size: sortedRiddles.length,
      message: 'List of riddle challenges with sorted answers by time count',
      data: sortedRiddles,
    });
  } catch (error: any) {
    next(new AppError(error, 500));
  }
}

export async function viewOneChallenge(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    console.log(req.params);
    if (!id) return next(new AppError('Provide challenge Id', 400));

    if (!(req as any).user._id)
      return next(new AppError('Access denied, login', 401));

    const challenge = await riddleModel.findOne({
      _id: id,
      user: (req as any).user._id,
    });

    if (!challenge) return next(new AppError('challenge do not exist', 400));

    res
      .status(200)
      .json({ status: 'success', message: 'Your challenge', data: challenge });
  } catch (error: any) {
    next(new AppError(error, 500));
  }
}
