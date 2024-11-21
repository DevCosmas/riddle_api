import { ActionsJson, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { Request, Response, NextFunction } from 'express';
import express from 'express';

const router = express.Router();

export const GET = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload: ActionsJson = {
      rules: [
        {
          pathPattern: '/example-path',
          apiPath: '/api/endpoint',
        },
      ],
    };

    // Set CORS headers for the response
    Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Respond with JSON payload
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

export const OPTIONS = (req: Request, res: Response) => {
  // Set CORS headers for preflight response
  Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  res.sendStatus(204);
};

// route
router.get('/api/actions', GET);

export default router;
