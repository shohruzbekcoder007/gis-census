import SurveyData from "../models/surveydata.model.js";

const surveyDataController = {

    // GET /survey-data/:surveyId - Ma'lum bir survey_id bo'yicha survey ma'lumotlarini olish
    getSurveyDataById: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;

            const surveyData = await SurveyData.findOne({ survey_id: surveyId });

            if (!surveyData) {
                return res.status(404).json({
                    error: 'Survey ma\'lumotlari topilmadi',
                    survey_id: surveyId
                });
            }
            return res.json(surveyData);

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    },

    // GET /survey-data/:neighborhood_tin - Ma'lum bir neighborhood_tin bo'yicha survey ma'lumotlarini olish
    getSurveyDataByNeighborhoodTin: async (req, res) => {
        try {
            const neighborhoodTin = req.params.neighborhood_tin;
            const surveyData = await SurveyData.find({ neighborhood_tin: neighborhoodTin }, null, { sort: { survey_id: 1 } }).select('neighborhood_tin  home_location -_id');

            if (!surveyData || surveyData.length === 0) {
                return res.status(404).json({
                    error: 'Survey ma\'lumotlari topilmadi',
                    neighborhood_tin: neighborhoodTin
                });
            }
            return res.json(surveyData);

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Xatolik yuzaga keldi',
                details: err.message
            });
        }
    }
};

export default surveyDataController;