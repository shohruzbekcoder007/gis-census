import express from 'express';
import adminAreaController from '../controllers/adminarea.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/adminarea/geometry:
 *   get:
 *     summary: Get admin area geometry by code
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: number
 *         description: Admin area code
 *       - in: query
 *         name: level
 *         required: false
 *         schema:
 *           type: number
 *           enum: [0, 1, 2, 3]
 *         description: Admin level (0=country, 1=region, 2=district, 3=mahalla)
 *     responses:
 *       200:
 *         description: Admin area geometry data
 *       400:
 *         description: Code parameter not provided
 *       404:
 *         description: Admin area not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/geometry', auth, adminAreaController.getGeometry);

/**
 * @swagger
 * /api/adminarea/by-level:
 *   get:
 *     summary: Get all admin areas by level
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: level
 *         required: true
 *         schema:
 *           type: number
 *           enum: [0, 1, 2, 3]
 *         description: Admin level (0=country, 1=region, 2=district, 3=mahalla)
 *       - in: query
 *         name: parent_id
 *         required: false
 *         schema:
 *           type: number
 *         description: Filter by parent ID
 *       - in: query
 *         name: include_geometry
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include geometry data in response
 *     responses:
 *       200:
 *         description: List of admin areas
 *       400:
 *         description: Level parameter not provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/by-level', auth, adminAreaController.getByLevel);

/**
 * @swagger
 * /api/adminarea/children:
 *   get:
 *     summary: Get children of an admin area by parent_id or code prefix
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         required: false
 *         schema:
 *           type: number
 *         description: Parent admin area ID
 *       - in: query
 *         name: code_prefix
 *         required: false
 *         schema:
 *           type: number
 *         description: 4-digit code prefix (e.g., 1735 returns all codes starting with 1735)
 *       - in: query
 *         name: include_geometry
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include geometry data in response
 *     responses:
 *       200:
 *         description: List of child admin areas
 *       400:
 *         description: parent_id or code_prefix parameter required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/children', auth, adminAreaController.getChildren);

/**
 * @swagger
 * /api/adminarea/hierarchy:
 *   get:
 *     summary: Get full hierarchy path for an admin area
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: number
 *         description: Admin area code
 *     responses:
 *       200:
 *         description: Hierarchy path from country to specified area
 *       400:
 *         description: Code parameter not provided
 *       404:
 *         description: Admin area not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/hierarchy', auth, adminAreaController.getHierarchy);

/**
 * @swagger
 * /api/adminarea/search:
 *   get:
 *     summary: Search admin areas by name
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: level
 *         required: false
 *         schema:
 *           type: number
 *           enum: [0, 1, 2, 3]
 *         description: Filter by admin level
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 20
 *         description: Maximum results to return
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Search query not provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search', auth, adminAreaController.search);

/**
 * @swagger
 * /api/adminarea/regions:
 *   get:
 *     summary: Respublika bo'yicha barcha regionlarni olish
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       200:
 *         description: Barcha regionlar (viloyatlar) ro'yxati geometry va code bilan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: number
 *                       geometry:
 *                         type: string
 *                       name_uz:
 *                         type: string
 *                       name_ru:
 *                         type: string
 *                       name_en:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/regions', auth, adminAreaController.getRegions);

/**
 * @swagger
 * /api/adminarea/polygon/{code}:
 *   get:
 *     summary: Code bo'yicha mahalla polygon ma'lumotini olish
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin area kodi
 *     responses:
 *       200:
 *         description: Mahalla polygon ma'lumotlari
 *       500:
 *         description: Server xatosi
 */
router.get('/polygon/:code', auth, adminAreaController.getMahhallaPolygonByCode);

/**
 * @swagger
 * /api/adminarea/polygons/{code}:
 *   get:
 *     summary: Code bo'yicha bolalar mahallalar polygonlarini olish
 *     tags: [AdminArea]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Ota admin area kodi
 *     responses:
 *       200:
 *         description: Bolalar mahallalar polygonlari ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get('/polygons/:code', auth, adminAreaController.getMahhallasPolygonByCode);

export default router;
