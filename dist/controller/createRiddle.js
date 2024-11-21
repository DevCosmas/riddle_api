"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAction = getAction;
exports.createRiddle = createRiddle;
exports.answerRiddle = answerRiddle;
exports.viewMyRiddleChallenge = viewMyRiddleChallenge;
exports.riddleRanking = riddleRanking;
exports.viewOneChallenge = viewOneChallenge;
const riddle_1 = __importDefault(require("../model/riddle"));
const app_error_1 = __importDefault(require("../global/app.error"));
const actions_1 = require("@solana/actions");
const web3_js_1 = require("@solana/web3.js");
const calc_duration_1 = __importDefault(require("../lib/calc_duration"));
const user_1 = __importDefault(require("../model/user"));
const userStartTimes = new Map();
function getAction(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.query;
            if (!id) {
                return next(new app_error_1.default('Riddle ID is required', 400));
            }
            // Retrieve the riddle from the database
            const riddle = yield riddle_1.default.findById(id);
            if (!riddle) {
                return next(new app_error_1.default('Riddle not found', 404));
            }
            const isGameDue = (0, calc_duration_1.default)(riddle);
            const iconURL = new URL(`/icons/${riddle.icon}`, `${req.protocol}://${req.get('host')}`).toString();
            const payload = {
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
            Object.entries(actions_1.ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            // Send the payload as JSON response
            res.status(200).json(payload);
        }
        catch (error) {
            next(new app_error_1.default(error.message, 500));
        }
    });
}
function createRiddle(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield user_1.default.findById(req.user._id);
            if (!user)
                return next(new app_error_1.default('You need to register', 400));
            try {
                const { question, answer, wager, options, duration, description } = req.body;
                const parsedDurationJSON = JSON.parse(duration);
                parsedDurationJSON.value = parseInt(parsedDurationJSON.value);
                console.log(parsedDurationJSON, typeof parsedDurationJSON);
                const inputData = {
                    question,
                    answer,
                    options,
                    wager: parseFloat(wager),
                    icon: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || req.body.icon,
                    description,
                    duration: parsedDurationJSON,
                    user: req.user._id,
                };
                // Check if each required field is provided
                if (!question || !answer || !wager) {
                    return next(new app_error_1.default('Question, Answer, and Wager cannot be blank', 400));
                }
                // Create and save the new riddle
                const newRiddle = yield riddle_1.default.create(inputData);
                const blink = `${req.protocol}://${req.get('host')}/api/riddle/action/get?id=${newRiddle._id}`;
                newRiddle.blink = blink;
                yield newRiddle.save();
                // Send response
                return res.status(201).json({
                    status: true,
                    message: 'Your riddle has been created',
                    data: newRiddle,
                });
            }
            catch (error) {
                next(new app_error_1.default(error, 500));
            }
        }
        catch (error) {
            next(new app_error_1.default(error, 500));
        }
    });
}
function answerRiddle(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // await measureTimeUntilCondition(() => shouldStopTimer);
            const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('mainnet-beta'), 'confirmed');
            const { id, post } = req.query;
            const { account } = req.body;
            if (!userStartTimes.has(account)) {
                // If the wallet address is not in the map, set the start time
                userStartTimes.set(account, Date.now());
            }
            const riddle = yield riddle_1.default.findById(id);
            const isGameDue = (0, calc_duration_1.default)(riddle);
            if (!riddle) {
                return next(new app_error_1.default('Riddle does not exist', 400));
            }
            // check if game duration is over, update riddle status to completed
            if (isGameDue) {
                riddle.status = 'completed';
                yield riddle.save();
                return next(new app_error_1.default('Riddle Challenge is over', 400));
            }
            if (riddle.answer === post) {
                const startTime = (_a = userStartTimes.get(account)) !== null && _a !== void 0 ? _a : Date.now();
                const endTime = Date.now();
                const timeSpent = (endTime - startTime) / 1000;
                const answerObj = {
                    walletAddress: account,
                    timeCount: timeSpent,
                    isCorrect: true,
                    answer: post,
                };
                // Prepare unsigned transaction
                const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: new web3_js_1.PublicKey(account),
                    toPubkey: new web3_js_1.PublicKey(process.env.WALLET_ADDRESS),
                    lamports: 0.005 * web3_js_1.LAMPORTS_PER_SOL,
                }));
                transaction.feePayer = new web3_js_1.PublicKey(account);
                transaction.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
                const payload = yield (0, actions_1.createPostResponse)({
                    fields: {
                        transaction,
                        message: 'You got the correct answer',
                        type: 'transaction',
                    },
                });
                riddle.answers.push(answerObj);
                yield riddle.save();
                userStartTimes.delete(account);
                console.log(riddle);
                // Set CORS headers for the response
                Object.entries(actions_1.ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
                res.status(200).json(payload);
            }
            else {
                res.status(400).json({ message: 'Your answer is wrong, try again' });
            }
        }
        catch (error) {
            next(new app_error_1.default(error || 'Server error', 500));
        }
    });
}
function viewMyRiddleChallenge(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
            const skip = (page - 1) * limit;
            // Find riddles, sort by isAnswered (ongoing at top), apply pagination
            const find_riddle = yield riddle_1.default
                .find({ user: req.user._id })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit);
            if (!find_riddle.length)
                return next(new app_error_1.default('No riddle challenge created yet', 400));
            res.status(200).json({
                status: 'success',
                page,
                limit,
                size: find_riddle.length,
                message: 'List of riddle challenges',
                data: find_riddle,
            });
        }
        catch (error) {
            next(new app_error_1.default(error, 500));
        }
    });
}
function riddleRanking(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            // Find riddles with pagination and sorting by isAnswered status
            const find_riddle = yield riddle_1.default
                .find({ user: req.user._id, status: 'ongoing' })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean(); // Use lean for faster, non-hydrated documents
            if (!find_riddle.length)
                return next(new app_error_1.default('No riddle challenge created yet', 400));
            // Sort each riddle's answers array by timeCount in ascending order
            const sortedRiddles = find_riddle.map((riddle) => (Object.assign(Object.assign({}, riddle), { answers: riddle.answers.sort((a, b) => a.timeCount - b.timeCount) })));
            res.status(200).json({
                status: 'success',
                page,
                limit,
                size: sortedRiddles.length,
                message: 'List of riddle challenges with sorted answers by time count',
                data: sortedRiddles,
            });
        }
        catch (error) {
            next(new app_error_1.default(error, 500));
        }
    });
}
function viewOneChallenge(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            console.log(req.params);
            if (!id)
                return next(new app_error_1.default('Provide challenge Id', 400));
            if (!req.user._id)
                return next(new app_error_1.default('Access denied, login', 401));
            const challenge = yield riddle_1.default.findOne({
                _id: id,
                user: req.user._id,
            });
            if (!challenge)
                return next(new app_error_1.default('challenge do not exist', 400));
            res
                .status(200)
                .json({ status: 'success', message: 'Your challenge', data: challenge });
        }
        catch (error) {
            next(new app_error_1.default(error, 500));
        }
    });
}
