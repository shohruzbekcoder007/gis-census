import pool from '../startup/dbpg.js';
import '../startup/db.js';
import House1708 from '../models/house.model.js';
import mongoose from 'mongoose';

const BATCH_SIZE = 1000;

// Sync pointer schema
const syncPointerSchema = new mongoose.Schema({
    sync_name: { type: String, required: true, unique: true },
    last_gid: { type: Number, default: 0 }
});

const SyncPointer = mongoose.model('sync_pointer_house', syncPointerSchema);

async function syncHouses1708() {
    try {
        console.log('Houses sinxronlash boshlandi...\n');
        
        // Pointer'dan oxirgi gid ni olish
        let pointer = await SyncPointer.findOne({ sync_name: 'house_sync' });
        if (!pointer) {
            pointer = new SyncPointer({ sync_name: 'house_sync', last_gid: 0 });
            await pointer.save();
        }

        const lastGid = pointer.last_gid;
        console.log(`Oxirgi ko'chirilgan gid: ${lastGid}\n`);

        // PostgreSQL dan jami yozuvlar sonini olish
        const countResult = await pool.query('SELECT COUNT(*) as total FROM admin.all_viloyats_merged WHERE gid > $1', [lastGid]);
        const totalRecords = parseInt(countResult.rows[0].total);
        console.log(`PostgreSQL da ko'chirilishi kerak: ${totalRecords} ta yozuv.\n`);

        if (totalRecords === 0) {
            console.log('Ko\'chirish uchun yangi ma\'lumot yo\'q.');
            return;
        }

        // MongoDB dagi mavjud yozuvlarni tekshirish
        const existingCount = await House1708.countDocuments();
        console.log(`MongoDB da mavjud: ${existingCount} ta yozuv.\n`);

        let totalInserted = 0;
        let batchNum = 0;
        let currentGid = lastGid;

        while (true) {
            batchNum++;

            // PostgreSQL dan batch olish (cursor - last_gid dan keyin)
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
                    geom::text as geometry,
                    centroid::text as centroid,
                    area_m2
                FROM admin.all_viloyats_merged
                WHERE gid > $1
                ORDER BY gid ASC
                LIMIT $2
            `;
            const result = await pool.query(query, [currentGid, BATCH_SIZE]);

            console.log(`Batch ${batchNum}: gid > ${currentGid} - ${result.rows.length} ta yozuv`);

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
                area_m2: row.area_m2
            }));

            // MongoDB ga upsert qilish
            const operations = houses.map(house => ({
                updateOne: {
                    filter: { gid: house.gid },
                    update: { $set: house },
                    upsert: true
                }
            }));

            try {
                const bulkResult = await House1708.bulkWrite(operations, { ordered: false });
                const inserted = bulkResult.upsertedCount;
                const updated = bulkResult.modifiedCount;
                totalInserted += inserted;
                console.log(`  - ${inserted} ta yangi, ${updated} ta yangilandi`);

                // Pointer'ni yangilash - oxirgi gid ni saqlash
                if (result.rows.length > 0) {
                    currentGid = result.rows[result.rows.length - 1].gid;
                    await SyncPointer.updateOne(
                        { sync_name: 'house_sync' },
                        { last_gid: currentGid }
                    );
                }
            } catch (err) {
                console.error(`  - Xatolik: ${err.message}`);
            }
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
