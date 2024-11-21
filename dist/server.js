"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const db_config_1 = __importDefault(require("./db.config"));
const global_error_handler_1 = __importDefault(require("./global/global.error.handler"));
const app_error_1 = __importDefault(require("./global/app.error"));
const riddle_1 = __importDefault(require("./routes/riddle"));
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Connect to MongoDB
(0, db_config_1.default)();
// Middleware setup
app.set('trust proxy', true);
app.use(express_1.default.json()); // Parse JSON requests
app.use(body_parser_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// Static file serving
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/icons', express_1.default.static(path_1.default.join(__dirname, 'icons')));
// Routes
app.use('/api/riddle', riddle_1.default);
app.use('/api/user', user_1.default);
// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new app_error_1.default('Page not found', 404));
});
// Global error handling
app.use(global_error_handler_1.default);
// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
