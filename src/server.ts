import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';
import mongoDbConnection from './db.config';
import errorHandler from './global/global.error.handler';
import AppError from './global/app.error';
import riddleRouter from './routes/riddle';
import path from 'path';
import userRouter from './routes/user';

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
mongoDbConnection();

// Middleware setup
app.set('trust proxy', true);
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(cookieParser());

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

// Routes
app.use('/api/riddle', riddleRouter);
app.use('/api/user', userRouter);

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError('Page not found', 404));
});

// Global error handling
app.use(errorHandler);

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
