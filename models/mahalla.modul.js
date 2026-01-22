import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mahallaSchema = new mongoose.Schema({
    name_uz: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100
    },
    parent_soato: {
        type: Number,
        required: true
    },
    soato: {
        type: Number,
        required: true
    },
    tin: {
        type: Number,
        required: true,
        index: true
    }
});

const Mahalla = mongoose.model('mahalla', mahallaSchema);

export default Mahalla;