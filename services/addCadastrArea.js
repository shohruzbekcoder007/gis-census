import pool from '../startup/dbpg.js';
import '../startup/db.js';
import House1708 from '../models/house1730.model.js';

const BATCH_SIZE = 1000;

async function syncHouses1708() {
    try {
        console.log('Houses 1708 sinxronlash boshlandi...\n');

        // PostgreSQL dan jami yozuvlar sonini olish
        const countResult = await pool.query('SELECT COUNT(*) as total FROM three_d.generated_buildings_1730');
        const totalRecords = parseInt(countResult.rows[0].total);
        console.log(`PostgreSQL da jami ${totalRecords} ta yozuv mavjud.\n`);

        if (totalRecords === 0) {
            console.log('Ko\'chirish uchun ma\'lumot yo\'q.');
            return;
        }

        // MongoDB dagi eski ma'lumotlarni o'chirish
        console.log('MongoDB dagi eski ma\'lumotlar o\'chirilmoqda...');
        const deleteResult = await House1708.deleteMany({});
        console.log(`${deleteResult.deletedCount} ta eski yozuv o'chirildi.\n`);

        let offset = 0;
        let totalInserted = 0;
        let batchNum = 0;

        while (offset < totalRecords) {
            batchNum++;
            console.log(`Batch ${batchNum}: ${offset} - ${Math.min(offset + BATCH_SIZE, totalRecords)}`);

            // PostgreSQL dan batch olish
            const query = `
                SELECT
                    gid,
                    viloyat_code,
                    tuman_code,
                    mahalla_tin,
                    cadastral_number,
                    street_name,
                    building_number,
                    use_type,
                    external_id,
                    ST_AsGeoJSON(geom)::text as geometry,
                    ST_AsGeoJSON(centroid)::text as centroid,
                    floors as number_floors,
                    height
                FROM three_d.generated_buildings_1703
                ORDER BY gid ASC
                LIMIT $1 OFFSET $2
            `;
            const result = await pool.query(query, [BATCH_SIZE, offset]);

            if (result.rows.length === 0) {
                break;
            }

            // Ma'lumotlarni MongoDB formatiga o'tkazish
            const houses = result.rows.map(row => ({
                gid: row.gid,
                viloyat_code: parseInt(row.viloyat_code) || null,
                tuman_code: parseInt(row.tuman_code) || null,
                mahalla_tin: parseInt(row.mahalla_tin) || null,
                cadastral_number: row.cadastral_number,
                street_name: row.street_name,
                building_number: row.building_number,
                use_type: row.use_type,
                external_id: parseInt(row.external_id) || null,
                geometry: row.geometry,
                centroid: row.centroid,
                number_floors: row.number_floors,
                height: row.height
            }));

            // MongoDB ga insert
            try {
                const insertResult = await House1708.insertMany(houses, { ordered: false });
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
        await syncHouses1708();
        process.exit(0);
    } catch (err) {
        console.error('Dastur xatosi:', err);
        process.exit(1);
    }
}

main();
