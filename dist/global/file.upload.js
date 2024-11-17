"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const app_error_1 = __importDefault(require("./app.error"));
// Multer configuration for file storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './dist/icons');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter function to restrict file types allowed for upload
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype ===
            'image/webp                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        const err = new app_error_1.default('Invalid file type', 400);
        cb(err, false);
    }
};
// Initializing multer with configured storage, fileFilter, and size limits
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
});
const uploadIcon = upload.single('icon');
exports.default = uploadIcon;
