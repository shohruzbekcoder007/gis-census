import mongoose from 'mongoose';

// SurveyData model - PostgreSQL dan MongoDB ga ko'chirish uchun
const SurveyDataSchema = new mongoose.Schema({
    survey_id: { type: String, required: true, unique: true, index: true },
    created_by_id: { type: String },
    payload_id: { type: String },
    app_version: { type: String },
    start_location: { type: String },
    finish_location: { type: String },
    start_date: { type: Date },
    finish_date: { type: Date },
    neighborhood_tin: { type: String },
    home_location: { type: String },
    area_number: { type: String },
    street: { type: String },
    street_id: { type: String },
    apartment_building: { type: String },
    korpus_number: { type: String },
    house_serial_number: { type: String },
    building_type: { type: String },
    building_area: { type: String },
    building_build_year: { type: String },
    building_build_exact_year: { type: String },
    wall_material: { type: String },
    farm_managers: { type: mongoose.Schema.Types.Mixed },
    form1_household_respondent_count: { type: String }
}, { timestamps: true, strict: false });

const SurveyData = mongoose.model('survey_data', SurveyDataSchema);

export default SurveyData;