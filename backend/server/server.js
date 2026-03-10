import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import corsOptions from './config/corsOptions.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Connect to database
connectDB().then(() => {
  // Database connected successfully
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

// Initialize express app
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



import fileRoutes from './routes/fileRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import mongoose from 'mongoose';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Sponsorship Platform API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database then start server (alternative to above, but let's just properly wrap listen)
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${err}`);
});
