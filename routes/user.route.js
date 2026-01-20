import express from 'express';
import auth from '../middleware/auth.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/login', userController.login);

router.post('/token', userController.getToken);

router.get('/info', auth, userController.getUserInfo);

export default router;

