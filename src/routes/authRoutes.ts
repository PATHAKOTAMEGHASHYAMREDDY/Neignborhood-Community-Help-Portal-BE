import express from 'express';
import { register, login, updateProfile } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.put('/profile', authenticateToken, updateProfile);

export default router;
