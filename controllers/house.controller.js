import House1703 from "../models/house1703.model.js";
import House1706 from "../models/house1706.model.js";
import House1708 from "../models/house1708.model.js";
import House1710 from "../models/house1710.model.js";
import House1712 from "../models/house1712.model.js";
import House1714 from "../models/house1714.model.js";
import House1718 from "../models/house1718.model.js";
import House1722 from "../models/house1722.model.js";
import House1724 from "../models/house1724.model.js";
import House1726 from "../models/house1726.model.js";
import House1727 from "../models/house1727.model.js";
import House1730 from "../models/house1730.model.js";
import House1733 from "../models/house1733.model.js";
import House1735 from "../models/house1735.model.js";
import House from "../models/house.model.js";
import Mahalla from "../models/mahalla.modul.js";

const houseController = {

    getHouseModelByCode: (code) => {
        const mapping = {
            1703: House1703,
            1706: House1706,
            1708: House1708,
            1710: House1710,
            1712: House1712,
            1714: House1714,
            1718: House1718,
            1722: House1722,
            1724: House1724,
            1726: House1726,
            1727: House1727,
            1730: House1730,
            1733: House1733,
            1735: House1735
        };
        return mapping[code];
    },

    getAllHouseByTin: async (req, res) => {
        try {
            const tin = req.params.tin;
            const mahalla = await Mahalla.findOne({ tin: tin });

            if (!mahalla) {
                return res.status(404).json({
                    error: 'Mahalla topilmadi',
                    tin: tin
                });
            }

            const { parent_soato } = mahalla;
            const HouseModel = houseController.getHouseModelByCode(String(parent_soato).slice(0, 4));
            console.log(parent_soato, HouseModel);

            if (!HouseModel) {
                return res.status(404).json({
                    error: 'Bu region uchun uy modeli topilmadi',
                    region_code: parent_soato
                });
            }

            const houses = await HouseModel.find({ mahalla_tin: tin });
            return res.json({
                count: houses.length,
                mahalla_tin: tin,
                region_code: parent_soato,
                items: houses
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    getAllHouseFullByTin: async (req, res) => {
        try {
            const tin = req.params.tin;
            // const mahalla = await Mahalla.findOne({ tin: tin });

            // if (!mahalla) {
            //     return res.status(404).json({
            //         error: 'Mahalla topilmadi',
            //         tin: tin
            //     });
            // }

            // const { parent_soato } = mahalla;
            // const HouseModel = houseController.getHouseModelByCode(String(parent_soato).slice(0, 4));
            // console.log(parent_soato, HouseModel);

            // if (!HouseModel) {
            //     return res.status(404).json({
            //         error: 'Bu region uchun uy modeli topilmadi',
            //         region_code: parent_soato
            //     });
            // }

            const houses = await House.find({ mahalla_tin: tin }).select('-_id -__v -cadastral_number -area_m2');
            return res.json({
                count: houses.length,
                mahalla_tin: tin,
                // region_code: parent_soato,
                items: houses
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

export default houseController;