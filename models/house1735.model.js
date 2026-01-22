import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
    gid: {
        type: Number,
        required: true,
    },
    viloyat_code: {
        type: Number,
        required: true,
    },
    tuman_code: {
        type: Number,
        required: true,
    },
    mahalla_tin: {
        type: Number,
        required: true,
    },
    cadastral_number: {
        type: String,
        required: true,
    },
    street_name: {
        type: String,
        required: true,
    },
    building_number: {
        type: String,
        required: true,
    },
    use_type: {
        type: String,
        required: true,
    },
    external_id: {
        type: Number,
        default: null,
    },
    geometry: {
        type: String, // GeoJSON string format
        default: null
    },
    centroid: {
        type: String, // GeoJSON string format
        default: null
    },
    number_floors: {
        type: Number,
        default: null,
    },
    height: {
        type: Number,
        default: null,
    }
});

const House1735 = mongoose.model('list_1735_house', houseSchema);


export default House1735;