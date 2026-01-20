import mongoose from 'mongoose';

const TargetSchema = new mongoose.Schema({
    region_soato: {
        type: Number,
        required: true,
    },
    district_soato: {
        type: Number,
        required: true,
    },
    tin: {
        type: Number,
        required: true,
    },
    neighbordhood: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        enum: ['ijtimoiy_hodim', 'inspektor', 'hokim_yordamchisi', 'xotin_qizlar', 'yoshlar', 'soliq', 'rais', 'boshqa'],    
        default: 'boshqa'
    },
    target: {
        type: Number,
        required: true,
    }
})

const Target = mongoose.model('target', TargetSchema);

export default Target;