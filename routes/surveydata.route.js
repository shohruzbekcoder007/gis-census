import express from 'express';
import surveyDataController from '../controllers/surveydata.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/survey-data/{surveyId}:
 *   get:
 *     summary: Survey ID bo'yicha ma'lumot olish
 *     tags: [SurveyData]
 *     parameters:
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Survey ma'lumotlari
 *       404:
 *         description: Survey topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get('/:surveyId', surveyDataController.getSurveyDataById);

/**
 * @swagger
 * /api/survey-data/neighborhood/{neighborhood_tin}:
 *   get:
 *     summary: Neighborhood TIN bo'yicha survey ma'lumotlarini olish
 *     tags: [SurveyData]
 *     parameters:
 *       - in: path
 *         name: neighborhood_tin
 *         required: true
 *         schema:
 *           type: string
 *         description: Mahalla TIN raqami
 *     responses:
 *       200:
 *         description: Survey ma'lumotlari ro'yxati
 *       404:
 *         description: Ma'lumot topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get('/neighborhood/:neighborhood_tin', surveyDataController.getSurveyDataByNeighborhoodTin);

export default router;