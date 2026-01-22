import express from 'express';
import mahallaController from '../controllers/mahalla.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/mahalla/region/{regionCode}:
 *   get:
 *     summary: Region code bo'yicha mahallalar ro'yxatini olish
 *     tags: [Mahalla]
 *     parameters:
 *       - in: path
 *         name: regionCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Region SOATO kodi
 *     responses:
 *       200:
 *         description: Mahallalar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get('/region/:regionCode', auth, mahallaController.getMahhallasByRegionCode);

/**
 * @swagger
 * /api/mahalla/{tin}:
 *   get:
 *     summary: Mahalla TIN bo'yicha ma'lumot olish
 *     tags: [Mahalla]
 *     parameters:
 *       - in: path
 *         name: tin
 *         required: true
 *         schema:
 *           type: string
 *         description: Mahalla TIN raqami
 *     responses:
 *       200:
 *         description: Mahalla ma'lumotlari
 *       404:
 *         description: Mahalla topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get('/:tin', auth, mahallaController.getMahallaByTin);

export default router;