import express from 'express';
import { createPayment, getPaymentsByUser, getAllPaymentsForAdmin } from '../controllers/paymentController.js';

const router = express.Router();

// Route to create a new payment
router.post('/', createPayment);

// Route to get all payments by a specific user (user view)
router.get('/user/:user_id', getPaymentsByUser);

// Route to get all payments (admin view)
router.get('/admin', getAllPaymentsForAdmin);

export default router;
