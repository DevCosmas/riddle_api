"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the schema with the types from IRiddle
const riddleSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: ['ongoing', 'completed'],
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
                validator: function (v) {
                    return v > 0;
                },
                message: (props) => `${props.value} is not a valid duration! Duration must be a positive number.`,
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
            validator: function (v) {
                return /^https?:\/\//.test(v); // Ensures it starts with http or https
            },
            message: (props) => `${props.value} is not a valid URL!`,
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});
// Add a text index on the question field to improve search capabilities
riddleSchema.index({ question: 'text' });
// Create and export the model
const riddleModel = (0, mongoose_1.model)('Riddle', riddleSchema);
exports.default = riddleModel;
