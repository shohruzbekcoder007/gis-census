import AdminArea from '../models/adminarea.model.js';

const adminAreaController = {
    // GET /geometry - Admin hudud geometriyasini olish
    getGeometry: async (req, res) => {
        try {
            const code = req.query.code;
            const level = req.query.level;

            if (!code) {
                return res.status(400).json({
                    error: 'code parametri kerak'
                });
            }

            const query = {
                code: parseInt(code),
                active: true
            };

            if (level !== undefined) {
                query.admin_level = parseInt(level);
            }

            const adminArea = await AdminArea.findOne(query);

            if (!adminArea) {
                return res.status(404).json({
                    error: 'Admin hudud topilmadi',
                    code: code,
                    level: level
                });
            }

            return res.json({
                id: adminArea.id,
                code: adminArea.code,
                admin_level: adminArea.admin_level,
                name_uz: adminArea.name_uz,
                name_ru: adminArea.name_ru,
                name_en: adminArea.name_en,
                geometry: adminArea.geometry,
                centroid: adminArea.centroid,
                bounding_box: adminArea.bounding_box,
                total_area_hectares: adminArea.total_area_hectares
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    // GET /by-level - Admin hududlarni level bo'yicha olish
    getByLevel: async (req, res) => {
        try {
            const level = req.query.level;
            const parent_id = req.query.parent_id;
            const include_geometry = req.query.include_geometry === 'true';

            if (level === undefined) {
                return res.status(400).json({
                    error: 'level parametri kerak'
                });
            }

            const query = {
                admin_level: parseInt(level),
                active: true
            };

            if (parent_id !== undefined) {
                query.parent_id = parseInt(parent_id);
            }

            let projection = {
                id: 1,
                code: 1,
                admin_level: 1,
                parent_id: 1,
                name_uz: 1,
                name_ru: 1,
                name_en: 1,
                total_area_hectares: 1
            };

            if (include_geometry) {
                projection.geometry = 1;
                projection.centroid = 1;
                projection.bounding_box = 1;
            }

            const adminAreas = await AdminArea.find(query, projection)
                .sort({ code: 1 });

            const items = adminAreas.map(area => {
                const item = {
                    id: area.id,
                    code: area.code,
                    admin_level: area.admin_level,
                    parent_id: area.parent_id,
                    name_uz: area.name_uz,
                    name_ru: area.name_ru,
                    name_en: area.name_en,
                    total_area_hectares: area.total_area_hectares
                };

                if (include_geometry) {
                    item.geometry = area.geometry;
                    item.centroid = area.centroid;
                    item.bounding_box = area.bounding_box;
                }

                return item;
            });

            return res.json({
                count: items.length,
                level: parseInt(level),
                parent_id: parent_id ? parseInt(parent_id) : null,
                items: items
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    // GET /children - Bolalar hududlarini olish
    getChildren: async (req, res) => {
        try {
            const {
                parent_id,
                code_prefix,
                limit = '1000',
                skip = '0'
            } = req.query;

            if (!parent_id && !code_prefix) {
                return res.status(400).json({
                    error: 'parent_id yoki code_prefix parametri majburiy'
                });
            }

            const parsedLimit = Math.min(parseInt(limit, 10) || 1000, 5000);
            const parsedSkip = parseInt(skip, 10) || 0;

            const query = { active: true };

            if (code_prefix) {
                const prefix = parseInt(code_prefix, 10);
                query.code = {
                    $gte: prefix * 1000,
                    $lt: (prefix + 1) * 1000
                };
            } else {
                query.parent_id = parseInt(parent_id, 10);
            }

            const projection = {
                _id: 0,
                code: 1,
                name_uz: 1,
                name_ru: 1,
                name_en: 1,
                geometry: 1
            };

            const items = await AdminArea.find(query)
                .select(projection)
                .sort({ code: 1 })
                .skip(parsedSkip)
                .limit(parsedLimit)
                .lean();

            return res.json({
                count: items.length,
                skip: parsedSkip,
                limit: parsedLimit,
                has_more: items.length === parsedLimit,
                items
            });

        } catch (err) {
            console.error('GET /children error:', err);
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // GET /hierarchy - Ierarxiya yo'lini olish
    getHierarchy: async (req, res) => {
        try {
            const code = req.query.code;

            if (!code) {
                return res.status(400).json({
                    error: 'code parametri kerak'
                });
            }

            const adminArea = await AdminArea.findOne({
                code: parseInt(code),
                active: true
            });

            if (!adminArea) {
                return res.status(404).json({
                    error: 'Admin hudud topilmadi',
                    code: code
                });
            }

            const hierarchy = await adminArea.getHierarchy();

            const hierarchyData = hierarchy.map(item => ({
                id: item.id,
                code: item.code,
                admin_level: item.admin_level,
                name_uz: item.name_uz,
                name_ru: item.name_ru,
                name_en: item.name_en
            }));

            return res.json({
                count: hierarchyData.length,
                hierarchy: hierarchyData
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    // GET /search - Qidiruv
    search: async (req, res) => {
        try {
            const q = req.query.q;
            const level = req.query.level;
            const limit = parseInt(req.query.limit) || 20;

            if (!q) {
                return res.status(400).json({
                    error: 'q parametri (qidiruv so\'zi) kerak'
                });
            }

            const query = {
                $text: { $search: q },
                active: true
            };

            if (level !== undefined) {
                query.admin_level = parseInt(level);
            }

            const results = await AdminArea.find(query, {
                score: { $meta: 'textScore' },
                id: 1,
                code: 1,
                admin_level: 1,
                parent_id: 1,
                name_uz: 1,
                name_ru: 1,
                name_en: 1
            })
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit);

            return res.json({
                count: results.length,
                query: q,
                items: results
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    // GET /regions - Respublika bo'yicha barcha regionlarni olish (geometry va code bilan)
    getRegions: async (req, res) => {
        try {
            const regions = await AdminArea.find({
                admin_level: 1,
                active: true
            }, {
                _id: 0,
                code: 1,
                geometry: 1,
                name_uz: 1,
                name_ru: 1,
                name_en: 1
            }).sort({ code: 1 }).lean();

            return res.json({
                count: regions.length,
                items: regions
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    }
};

export default adminAreaController;
