import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const MONGODB_CONNECTION_URL: string = process.env
  .MONGODB_CONNECTION_URI as string;
const mongoDbConnection = (): void => {
  mongoose.connect(MONGODB_CONNECTION_URL);
  mongoose.connection.on('connected', () => {
    console.log('Database connected successfully');
  });
  mongoose.connection.on('error', (err) => {
    console.log(`An error has occurred: ${err}`);
  });
};

export default mongoDbConnection;
