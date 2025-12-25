import express from 'express';
import { sendOTP, verifyOTP, resetPassword } from '../controllers/passwordResetController';

const router = express.Router();

// Send OTP to email
router.post('/send-otp', sendOTP);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Reset password
router.post('/reset-password', resetPassword);

export default router;
