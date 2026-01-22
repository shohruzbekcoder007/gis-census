import pool from '../startup/dbpg.js';
import '../startup/db.js';
import AdminArea from '../models/adminarea.model.js';

const BATCH_SIZE = 100;

async function syncAdminAreas() {
    try {
        console.log('Admin areas sinxronlash boshlandi...\n');

        // PostgreSQL dan jami yozuvlar sonini olish (barcha admin_level)
        const countResult = await pool.query('SELECT COUNT(*) as total FROM admin.admin_areas');
        const totalRecords = parseInt(countResult.rows[0].total);
        console.log(`PostgreSQL da jami ${totalRecords} ta yozuv mavjud.\n`);

        if (totalRecords === 0) {
            console.log('Ko\'chirish uchun ma\'lumot yo\'q.');
            return;
        }

        // MongoDB dagi barcha admin_areas ma'lumotlarni o'chirish
        console.log('MongoDB dagi eski ma\'lumotlar o\'chirilmoqda...');
        const deleteResult = await AdminArea.deleteMany({});
        console.log(`${deleteResult.deletedCount} ta eski yozuv o'chirildi.\n`);

        let offset = 0;
        let totalInserted = 0;
        let batchNum = 0;

        while (offset < totalRecords) {
            batchNum++;
            console.log(`Batch ${batchNum}: ${offset} - ${Math.min(offset + BATCH_SIZE, totalRecords)}`);

            // PostgreSQL dan batch olish (geometry ni GeoJSON formatda olish)
            const query = `
                SELECT
                    id,
                    admin_level,
                    parent_id,
                    admin_type_id,
                    code,
                    external_id,
                    iso_code,
                    name_uz,
                    name_ru,
                    name_en,
                    name_cyrillic,
                    alternative_names,
                    ST_AsGeoJSON(geometry)::text as geometry,
                    ST_AsGeoJSON(centroid)::text as centroid,
                    ST_AsGeoJSON(bounding_box)::text as bounding_box,
                    total_area_hectares,
                    land_area_hectares,
                    water_area_hectares,
                    administrative_center,
                    establishment_date,
                    legal_document,
                    source_id,
                    data_version,
                    quality_score,
                    created_at,
                    updated_at,
                    active,
                    verified,
                    utm_zone
                FROM admin.admin_areas
                ORDER BY id ASC
                LIMIT $1 OFFSET $2
            `;
            const result = await pool.query(query, [BATCH_SIZE, offset]);

            if (result.rows.length === 0) {
                break;
            }

            // Ma'lumotlarni MongoDB formatiga o'tkazish
            const adminAreas = result.rows.map(row => ({
                id: row.id,
                admin_level: row.admin_level,
                parent_id: row.parent_id,
                admin_type_id: row.admin_type_id,
                code: row.code,
                external_id: row.external_id,
                iso_code: row.iso_code,
                name_uz: row.name_uz,
                name_ru: row.name_ru,
                name_en: row.name_en,
                name_cyrillic: row.name_cyrillic,
                alternative_names: row.alternative_names,
                geometry: row.geometry, // GeoJSON format
                centroid: row.centroid,
                bounding_box: row.bounding_box, // GeoJSON format
                total_area_hectares: row.total_area_hectares,
                land_area_hectares: row.land_area_hectares,
                water_area_hectares: row.water_area_hectares,
                administrative_center: row.administrative_center,
                establishment_date: row.establishment_date,
                legal_document: row.legal_document,
                source_id: row.source_id,
                data_version: row.data_version,
                quality_score: row.quality_score,
                created_at: row.created_at,
                updated_at: row.updated_at,
                active: row.active,
                verified: row.verified,
                utm_zone: row.utm_zone
            }));

            // MongoDB ga insert
            try {
                const insertResult = await AdminArea.insertMany(adminAreas, { ordered: false });
                totalInserted += insertResult.length;
                console.log(`  - ${insertResult.length} ta yozuv qo'shildi`);
            } catch (err) {
                if (err.code === 11000) {
                    const inserted = err.insertedDocs?.length || 0;
                    totalInserted += inserted;
                    console.log(`  - ${inserted} ta yozuv qo'shildi (duplikatlar o'tkazib yuborildi)`);
                } else {
                    throw err;
                }
            }

            offset += BATCH_SIZE;
        }

        console.log(`\n✅ Sinxronlash tugadi!`);
        console.log(`   Jami ko'chirilgan: ${totalInserted} ta yozuv`);

    } catch (err) {
        console.error('Xatolik:', err.message);
        throw err;
    }
}

async function main() {
    try {
        await syncAdminAreas();
        process.exit(0);
    } catch (err) {
        console.error('Dastur xatosi:', err);
        process.exit(1);
    }
}

main();
