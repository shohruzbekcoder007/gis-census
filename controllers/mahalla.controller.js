import Mahalla from '../models/mahalla.modul.js';

const mahallaController = {
    // GET /mahalla/:tin - Ma'lum bir mahalla TIN bo'yicha ma'lumotlarni olish
    getMahallaByTin: async (req, res) => {
        try {
            const tin = req.params.tin;
            const mahalla = await Mahalla.findOne({ tin: tin });

            if (!mahalla) {
                return res.status(404).json({
                    error: 'Mahalla ma\'lumotlari topilmadi',
                    tin: tin
                });
            }
            return res.json(mahalla);

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    getMahhallasByRegionCode: async (req, res) => {
        try {
            const regionCode = req.params.regionCode;
            const mahallas = await Mahalla.find({ parent_soato: regionCode });
            return res.json(mahallas);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },
};

export default mahallaController;