import mongoose from 'mongoose';

const adminAreaSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    admin_level: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3], // 0=country, 1=region, 2=district, 3=mahalla
        index: true
    },
    parent_id: {
        type: Number,
        default: null,
        index: true
    },
    admin_type_id: {
        type: Number,
        required: true
    },
    code: {
        type: Number,
        required: true,
        index: true
    },
    external_id: {
        type: Number,
        default: null
    },
    iso_code: {
        type: String,
        default: null,
        maxlength: 10
    },
    name_uz: {
        type: String,
        required: true,
        index: true
    },
    name_ru: {
        type: String,
        default: null
    },
    name_en: {
        type: String,
        default: null
    },
    name_cyrillic: {
        type: String,
        default: null
    },
    alternative_names: {
        type: String,
        default: null
    },
    geometry: {
        type: {
            type: String,
            enum: ['MultiPolygon', 'Polygon'],
            default: 'MultiPolygon'
        },
        coordinates: {
            type: mongoose.Schema.Types.Mixed, // Array structure for GeoJSON
            default: null
        }
    },
    centroid: {
        type: String, // WKB hex format
        default: null
    },
    bounding_box: {
        type: {
            type: String,
            enum: ['Polygon'],
            default: 'Polygon'
        },
        coordinates: {
            type: mongoose.Schema.Types.Mixed, // Array structure for GeoJSON
            default: null
        }
    },
    total_area_hectares: {
        type: Number,
        default: null
    },
    land_area_hectares: {
        type: Number,
        default: null
    },
    water_area_hectares: {
        type: Number,
        default: null
    },
    administrative_center: {
        type: String,
        default: null
    },
    establishment_date: {
        type: Date,
        default: null
    },
    legal_document: {
        type: String,
        default: null
    },
    source_id: {
        type: Number,
        default: null
    },
    data_version: {
        type: String,
        default: null
    },
    quality_score: {
        type: Number,
        default: null,
        min: 0,
        max: 100
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    utm_zone: {
        type: Number,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'admin_areas'
});

// Indexes for performance
adminAreaSchema.index({ id: 1 }, { unique: true }); // Primary key
adminAreaSchema.index({ code: 1 }); // For code lookups
adminAreaSchema.index({ admin_level: 1 }); // For level queries
adminAreaSchema.index({ parent_id: 1 }); // For children queries
adminAreaSchema.index({ active: 1 }); // For active filtering
adminAreaSchema.index({ code: 1, active: 1 }); // Optimized for code range queries with active filter
adminAreaSchema.index({ parent_id: 1, active: 1 }); // Optimized for children queries with active filter
adminAreaSchema.index({ admin_level: 1, parent_id: 1 }); // Combined level and parent queries
adminAreaSchema.index({ active: 1, admin_level: 1 }); // Active + level filtering
adminAreaSchema.index({ name_uz: 'text', name_ru: 'text', name_en: 'text' }); // Full-text search
adminAreaSchema.index({ 'geometry.type': 1 }); // For geometry type queries
adminAreaSchema.index({ iso_code: 1 }); // For ISO code lookups

// Virtual for getting children
adminAreaSchema.virtual('children', {
    ref: 'AdminArea',
    localField: 'id',
    foreignField: 'parent_id'
});

// Instance method to get full hierarchy path
adminAreaSchema.methods.getHierarchy = async function() {
    const hierarchy = [this];
    let current = this;

    while (current.parent_id !== null) {
        current = await this.model('AdminArea').findOne({ id: current.parent_id });
        if (!current) break;
        hierarchy.unshift(current);
    }

    return hierarchy;
};

// Static method to find by admin level
adminAreaSchema.statics.findByLevel = function(level) {
    return this.find({ admin_level: level, active: true });
};

// Static method to find children
adminAreaSchema.statics.findChildren = function(parentId) {
    return this.find({ parent_id: parentId, active: true });
};

const AdminArea = mongoose.model('admin_area', adminAreaSchema);

export default AdminArea;
