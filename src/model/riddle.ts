import { Schema, model, Document, Types } from 'mongoose';

// Define an interface for Answers
export interface IAnswers {
  walletAddress: string;
  timeCount: number;
  isCorrect: boolean;
  answer: string;
}

// Define an interface for the Riddle document
export interface IRiddle extends Document {
  user: Types.ObjectId; // Reference to the User model
  question: string;
  answer: string;
  options: string[];
  status: string;
  blink: string;
  wager: number;
  icon: string;
  description: string;
  duration: {
    value: number;
    unit: string;
  };
  answers: IAnswers[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema with the types from IRiddle
const riddleSchema = new Schema<IRiddle>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Question cannot be blank'],
    },
    answer: {
      type: String,
      required: [true, 'Provide riddle Answer'],
    },
    options: {
      type: [String],
      required: [true, 'Set your options'],
    },
    answers: {
      type: [
        {
          walletAddress: String,
          timeCount: Number,
          isCorrect: Boolean,
          answer: String,
        },
      ],
    },
    status: {
      type: String,
      enum:['ongoing','completed'],
      default: 'ongoing',
    },
    wager: {
      type: Number,
      required: [true, 'Provide Wager Amount'],
      min: [1, 'Wager should be at least $1 dollar'],
    },
    icon: String,
    description: String,
    duration: {
      value: {
        type: Number,
        required: [true, 'Provide Duration'],
        validate: {
          validator: function (v: number) {
            return v > 0;
          },
          message: (props: any) =>
            `${props.value} is not a valid duration! Duration must be a positive number.`,
        },
      },
      unit: {
        type: String,
        enum: ['seconds', 'minutes', 'hours', 'days'],
        required: [true, 'Provide Duration Unit'],
        default: 'seconds',
      },
    },
    blink: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\//.test(v); // Ensures it starts with http or https
        },
        message: (props: any) => `${props.value} is not a valid URL!`,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add a text index on the question field to improve search capabilities
riddleSchema.index({ question: 'text' });

// Create and export the model
const riddleModel = model<IRiddle>('Riddle', riddleSchema);
export default riddleModel;
