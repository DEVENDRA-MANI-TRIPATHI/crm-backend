import express from 'express';
import dotenv from 'dotenv';
import db from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());

// Pass database connection to all requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queries', queryRoutes);
// Use Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); 

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
