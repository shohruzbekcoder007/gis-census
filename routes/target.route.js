import express from 'express';
import TargetController from '../controllers/target.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/targets:
 *   get:
 *     summary: Barcha targetlarni olish
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: region_soato
 *         schema:
 *           type: number
 *         description: Region SOATO kodi bo'yicha filter
 *       - in: query
 *         name: district_soato
 *         schema:
 *           type: number
 *         description: District SOATO kodi bo'yicha filter
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [ijtimoiy_hodim, inspektor, hokim_yordamchisi, xotin_qizlar, yoshlar, soliq, rais]
 *         description: Lavozim bo'yicha filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Sahifa raqami
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *         description: Sahifadagi yozuvlar soni
 *     responses:
 *       200:
 *         description: Targetlar ro'yxati
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.get('/', auth, TargetController.getAll);

/**
 * @swagger
 * /api/targets/sum-by-region:
 *   get:
 *     summary: Region bo'yicha targetlar yig'indisi
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: region_soato
 *         schema:
 *           type: number
 *         description: Ma'lum region uchun filter (ixtiyoriy)
 *     responses:
 *       200:
 *         description: Regionlar bo'yicha targetlar yig'indisi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.get('/sum-by-region', auth, TargetController.sumByRegion);

/**
 * @swagger
 * /api/targets/sum-by-district:
 *   get:
 *     summary: District bo'yicha targetlar yig'indisi
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: region_soato
 *         schema:
 *           type: number
 *         description: Region bo'yicha filter (ixtiyoriy)
 *       - in: query
 *         name: district_soato
 *         schema:
 *           type: number
 *         description: District bo'yicha filter (ixtiyoriy)
 *     responses:
 *       200:
 *         description: Districtlar bo'yicha targetlar yig'indisi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.get('/sum-by-district', auth, TargetController.sumByDistrict);

/**
 * @swagger
 * /api/targets/{id}:
 *   get:
 *     summary: Bitta targetni ID bo'yicha olish
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Target ID
 *     responses:
 *       200:
 *         description: Target ma'lumotlari
 *       404:
 *         description: Target topilmadi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.get('/:id', auth, TargetController.getById);

/**
 * @swagger
 * /api/targets:
 *   post:
 *     summary: Yangi target yaratish
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - region_soato
 *               - district_soato
 *               - tin
 *               - neighbordhood
 *               - position
 *               - target
 *             properties:
 *               region_soato:
 *                 type: number
 *               district_soato:
 *                 type: number
 *               tin:
 *                 type: number
 *               neighbordhood:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [ijtimoiy_hodim, inspektor, hokim_yordamchisi, xotin_qizlar, yoshlar, soliq, rais]
 *               target:
 *                 type: number
 *     responses:
 *       201:
 *         description: Target yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.post('/', auth, TargetController.create);

/**
 * @swagger
 * /api/targets/bulk:
 *   post:
 *     summary: Ko'plab targetlarni yaratish
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targets
 *             properties:
 *               targets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     region_soato:
 *                       type: number
 *                     district_soato:
 *                       type: number
 *                     tin:
 *                       type: number
 *                     neighbordhood:
 *                       type: string
 *                     position:
 *                       type: string
 *                     target:
 *                       type: number
 *     responses:
 *       201:
 *         description: Targetlar yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.post('/bulk', auth, TargetController.bulkCreate);

/**
 * @swagger
 * /api/targets/{id}:
 *   put:
 *     summary: Targetni yangilash
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Target ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               region_soato:
 *                 type: number
 *               district_soato:
 *                 type: number
 *               tin:
 *                 type: number
 *               neighbordhood:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [ijtimoiy_hodim, inspektor, hokim_yordamchisi, xotin_qizlar, yoshlar, soliq, rais]
 *               target:
 *                 type: number
 *     responses:
 *       200:
 *         description: Target yangilandi
 *       404:
 *         description: Target topilmadi
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.put('/:id', auth, TargetController.update);

/**
 * @swagger
 * /api/targets/{id}:
 *   delete:
 *     summary: Targetni o'chirish
 *     tags: [Targets]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Target ID
 *     responses:
 *       200:
 *         description: Target o'chirildi
 *       404:
 *         description: Target topilmadi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.delete('/:id', auth, TargetController.delete);

export default router;