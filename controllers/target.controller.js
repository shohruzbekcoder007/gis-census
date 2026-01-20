import Target from '../models/target.model.js';

const targetController = {
    // CREATE - Yangi target yaratish
    create: async (req, res) => {
        try {
            const { region_soato, district_soato, tin, neighbordhood, position, target } = req.body;

            const newTarget = new Target({
                region_soato,
                district_soato,
                tin,
                neighbordhood,
                position,
                target
            });

            await newTarget.save();

            return res.status(201).json({
                message: 'Target muvaffaqiyatli yaratildi',
                data: newTarget
            });

        } catch (err) {
            console.error(err);
            if (err.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validatsiya xatosi',
                    details: err.message
                });
            }
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // READ ALL - Barcha targetlarni olish
    getAll: async (req, res) => {
        try {
            const { region_soato, district_soato, position, page = 1, limit = 50 } = req.query;

            const query = {};

            if (region_soato) query.region_soato = parseInt(region_soato);
            if (district_soato) query.district_soato = parseInt(district_soato);
            if (position) query.position = position;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [targets, total] = await Promise.all([
                Target.find(query)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Target.countDocuments(query)
            ]);

            return res.json({
                count: targets.length,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                items: targets
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // READ ONE - Bitta targetni olish
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const target = await Target.findById(id).lean();

            if (!target) {
                return res.status(404).json({
                    error: 'Target topilmadi'
                });
            }

            return res.json(target);

        } catch (err) {
            console.error(err);
            if (err.name === 'CastError') {
                return res.status(400).json({
                    error: 'Noto\'g\'ri ID formati'
                });
            }
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // UPDATE - Targetni yangilash
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { region_soato, district_soato, tin, neighbordhood, position, target } = req.body;

            const updateData = {};
            if (region_soato !== undefined) updateData.region_soato = region_soato;
            if (district_soato !== undefined) updateData.district_soato = district_soato;
            if (tin !== undefined) updateData.tin = tin;
            if (neighbordhood !== undefined) updateData.neighbordhood = neighbordhood;
            if (position !== undefined) updateData.position = position;
            if (target !== undefined) updateData.target = target;

            const updatedTarget = await Target.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedTarget) {
                return res.status(404).json({
                    error: 'Target topilmadi'
                });
            }

            return res.json({
                message: 'Target muvaffaqiyatli yangilandi',
                data: updatedTarget
            });

        } catch (err) {
            console.error(err);
            if (err.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validatsiya xatosi',
                    details: err.message
                });
            }
            if (err.name === 'CastError') {
                return res.status(400).json({
                    error: 'Noto\'g\'ri ID formati'
                });
            }
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // DELETE - Targetni o'chirish
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedTarget = await Target.findByIdAndDelete(id);

            if (!deletedTarget) {
                return res.status(404).json({
                    error: 'Target topilmadi'
                });
            }

            return res.json({
                message: 'Target muvaffaqiyatli o\'chirildi',
                data: deletedTarget
            });

        } catch (err) {
            console.error(err);
            if (err.name === 'CastError') {
                return res.status(400).json({
                    error: 'Noto\'g\'ri ID formati'
                });
            }
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // BULK CREATE - Ko'plab targetlarni yaratish
    bulkCreate: async (req, res) => {
        try {
            const { targets } = req.body;

            if (!Array.isArray(targets) || targets.length === 0) {
                return res.status(400).json({
                    error: 'targets massivi kerak'
                });
            }

            const createdTargets = await Target.insertMany(targets, { ordered: false });

            return res.status(201).json({
                message: `${createdTargets.length} ta target muvaffaqiyatli yaratildi`,
                count: createdTargets.length,
                data: createdTargets
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // SUM BY REGION - Region bo'yicha targetlar yig'indisi
    sumByRegion: async (req, res) => {
        try {
            const { region_soato } = req.query;

            const matchStage = {};
            if (region_soato) {
                matchStage.region_soato = parseInt(region_soato);
            }

            const result = await Target.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$region_soato',
                        total_target: { $sum: '$target' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        region_soato: '$_id',
                        total_target: 1,
                        count: 1
                    }
                },
                { $sort: { region_soato: 1 } }
            ]);

            return res.json({
                count: result.length,
                items: result
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    },

    // SUM BY DISTRICT - District bo'yicha targetlar yig'indisi
    sumByDistrict: async (req, res) => {
        try {
            const { region_soato, district_soato } = req.query;

            const matchStage = {};
            if (region_soato) {
                matchStage.region_soato = parseInt(region_soato);
            }
            if (district_soato) {
                matchStage.district_soato = parseInt(district_soato);
            }

            const result = await Target.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: {
                            region_soato: '$region_soato',
                            district_soato: '$district_soato'
                        },
                        total_target: { $sum: '$target' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        region_soato: '$_id.region_soato',
                        district_soato: '$_id.district_soato',
                        total_target: 1,
                        count: 1
                    }
                },
                { $sort: { region_soato: 1, district_soato: 1 } }
            ]);

            return res.json({
                count: result.length,
                items: result
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Server xatosi',
                details: err.message
            });
        }
    }
};

export default targetController;