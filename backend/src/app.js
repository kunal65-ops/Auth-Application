const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');
const ApiResponse = require('./utils/ApiResponse');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const app = express();
app.use(helmet());
const allowedOrigins = [
  (process.env.FRONTEND_URL || '').trim(),
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.get('/api/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: 'OK' }, 'Server is healthy and running'));
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});
app.use(errorHandler);
module.exports = app;