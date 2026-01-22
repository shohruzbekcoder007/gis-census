import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
    gid: {
        type: Number,
        required: true,
    },
    viloyat_code: {
        type: Number,
        default: null,
    },
    tuman_code: {
        type: Number,
        default: null,
    },
    mahalla_tin: {
        type: Number,
        default: null,
    },
    cadastral_number: {
        type: String,
        default: null,
    },
    street_name: {
        type: String,
        default: null,
    },
    building_number: {
        type: String,
        default: null,
    },
    use_type: {
        type: String,
        default: null,
    },
    external_id: {
        type: Number,
        default: null,
    },
    geometry: {
        type: String,
        default: null
    },
    centroid: {
        type: String,
        default: null
    },
    area_m2: {
        type: Number,
        default: null
    }
});

const House = mongoose.model('list_house', houseSchema);


export default House;