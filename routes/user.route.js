import express from 'express';
import auth from '../middlewares/auth.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Foydalanuvchi tizimga kirishi
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli kirish
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 */
router.post('/login', userController.login);


/**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: Yangi token olish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangi token
 *       401:
 *         description: Token yaroqsiz
 */
router.post('/refresh', userController.refreshToken);

/**
 * @swagger
 * /api/users/info:
 *   get:
 *     summary: Foydalanuvchi ma'lumotlarini olish
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari
 *       401:
 *         description: Avtorizatsiya talab qilinadi
 */
router.get('/info', auth, userController.getUserInfo);

export default router;

