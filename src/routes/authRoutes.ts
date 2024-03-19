import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// GOOGLE Login
router.get('/google', authController.loginWithGoogle);

// GOOGLE callback login
router.get('/google/callback', authController.googleCallback)

export default router;
