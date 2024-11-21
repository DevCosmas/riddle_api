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
exports.OPTIONS = exports.GET = void 0;
const actions_1 = require("@solana/actions");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const GET = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = {
            rules: [
                {
                    pathPattern: '/example-path',
                    apiPath: '/api/endpoint',
                },
            ],
        };
        // Set CORS headers for the response
        Object.entries(actions_1.ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        // Respond with JSON payload
        res.status(200).json(payload);
    }
    catch (error) {
        next(error);
    }
});
exports.GET = GET;
const OPTIONS = (req, res) => {
    // Set CORS headers for preflight response
    Object.entries(actions_1.ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    res.sendStatus(204);
};
exports.OPTIONS = OPTIONS;
// route
router.get('/api/actions', exports.GET);
exports.default = router;
