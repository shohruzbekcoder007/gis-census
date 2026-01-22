import express from 'express';
import houseController from '../controllers/house.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/house/neighborhood/{tin}:
 *   get:
 *     summary: Mahalla TIN bo'yicha barcha uy-joylarni olish
 *     tags: [House]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: tin
 *         required: true
 *         schema:
 *           type: string
 *         description: Mahalla TIN raqami
 *     responses:
 *       200:
 *         description: Uy-joylar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get('/neighborhood/:tin', auth, houseController.getAllHouseByTin);

/**
 * @swagger
 * /api/house/neighborhoodfull/{tin}:
 *   get:
 *     summary: Mahalla TIN bo'yicha barcha uy-joylarni to'liq olish (umumiy bazadan)
 *     tags: [House]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: tin
 *         required: true
 *         schema:
 *           type: string
 *         description: Mahalla TIN raqami
 *     responses:
 *       200:
 *         description: Uy-joylar to'liq ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get('/neighborhoodfull/:tin', auth, houseController.getAllHouseFullByTin);

export default router;