"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const sales_1 = __importDefault(require("./routes/sales"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const reports_1 = __importDefault(require("./routes/reports"));
const settings_1 = __importDefault(require("./routes/settings"));
const users_1 = __importDefault(require("./routes/users"));
const notifications_1 = __importDefault(require("./routes/notifications"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/products', products_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/sales', sales_1.default);
app.use('/api/invoices', invoices_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/notifications', notifications_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'HEALTHY',
        service: 'Nexus Business Management REST API',
        timestamp: new Date().toISOString(),
        version: '1.1.0'
    });
});
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(err.status || 500).json({
        error: err.message || 'An unexpected internal server error occurred.'
    });
});
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Nexus Business Management Server running on port ${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
});
