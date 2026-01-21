import pool from '../../startup/dbpg.js';
import '../../startup/db.js';
import SurveyData from '../../models/surveydata.model.js';
import mongoose from 'mongoose';

// Pointer saqlash uchun model
const SyncPointerSchema = new mongoose.Schema({
    collection_name: { type: String, required: true, unique: true },
    last_survey_id: { type: String, default: '0' },
    last_sync_date: { type: Date, default: Date.now },
    total_synced: { type: Number, default: 0 }
});

const SyncPointer = mongoose.model('sync_pointer', SyncPointerSchema);

const BATCH_SIZE = 1000; // Har bir batch da nechta yozuv
const COLLECTION_NAME = 'survey_data';

async function getLastPointer() {
    let pointer = await SyncPointer.findOne({ collection_name: COLLECTION_NAME });
    if (!pointer) {
        pointer = await SyncPointer.create({
            collection_name: COLLECTION_NAME,
            last_survey_id: '0',
            total_synced: 0
        });
    }
    return pointer;
}

async function updatePointer(lastSurveyId, totalSynced) {
    await SyncPointer.updateOne(
        { collection_name: COLLECTION_NAME },
        {
            last_survey_id: lastSurveyId,
            last_sync_date: new Date(),
            $inc: { total_synced: totalSynced }
        }
    );
}

async function syncSurveyData() {
    try {
        console.log('Survey data sinxronlash boshlandi...\n');

        // Oxirgi pointerni olish
        const pointer = await getLastPointer();
        console.log(`Oxirgi pointer: survey_id = ${pointer.last_survey_id}`);
        console.log(`Jami sinxronlangan: ${pointer.total_synced} ta\n`);

        // PostgreSQL dan yangi yozuvlar sonini olish
        const countResult = await pool.query(
            'SELECT COUNT(*) as total FROM public.survey_data WHERE survey_id > $1',
            [pointer.last_survey_id]
        );
        const newRecords = parseInt(countResult.rows[0].total);
        console.log(`Yangi yozuvlar soni: ${newRecords} ta\n`);

        if (newRecords === 0) {
            console.log('Ko\'chirish uchun yangi ma\'lumot yo\'q.');
            return;
        }

        let lastSurveyId = pointer.last_survey_id;
        let totalInserted = 0;
        let batchNum = 0;

        // Pointer dan boshlab batch qilib o'qish
        while (true) {
            batchNum++;
            console.log(`Batch ${batchNum}: survey_id > ${lastSurveyId}`);

            // PostgreSQL dan batch olish (pointer dan keyingi yozuvlar)
            const query = `
                SELECT * FROM public.survey_data
                WHERE survey_id > $1
                ORDER BY survey_id ASC
                LIMIT $2
            `;
            const result = await pool.query(query, [lastSurveyId, BATCH_SIZE]);

            if (result.rows.length === 0) {
                break;
            }

            // Debug: birinchi batch da PostgreSQL dan kelgan ma'lumotlarni ko'rsatish
            if (batchNum === 1) {
                console.log('\n=== DEBUG: PostgreSQL dan kelgan birinchi yozuv ===');
                console.log('Fieldlar:', Object.keys(result.rows[0]));
                console.log('survey_id qiymati:', result.rows[0].survey_id);
                console.log('Birinchi yozuv:', JSON.stringify(result.rows[0], null, 2));
                console.log('=== DEBUG END ===\n');
            }

            // MongoDB ga batch insert (upsert ishlatamiz - mavjud bo'lsa yangilaydi, yo'q bo'lsa qo'shadi)
            let insertedCount = 0;
            const bulkOps = result.rows.map(row => ({
                updateOne: {
                    filter: { survey_id: row.survey_id },
                    update: { $set: row },
                    upsert: true
                }
            }));

            const bulkResult = await SurveyData.bulkWrite(bulkOps, { ordered: false });
            insertedCount = bulkResult.upsertedCount + bulkResult.modifiedCount;
            totalInserted += bulkResult.upsertedCount;
            console.log(`  - ${bulkResult.upsertedCount} ta yangi, ${bulkResult.modifiedCount} ta yangilandi, matched: ${bulkResult.matchedCount}`);

            // Oxirgi survey_id ni yangilash
            lastSurveyId = result.rows[result.rows.length - 1].survey_id;

            // Pointerni saqlash (har batch dan keyin)
            await updatePointer(lastSurveyId, result.rows.length);

            if (result.rows.length < BATCH_SIZE) {
                break; // Oxirgi batch
            }
        }

        console.log(`\n✅ Sinxronlash tugadi!`);
        console.log(`   Bu sessiyada ko'chirilgan: ${totalInserted} ta yozuv`);
        console.log(`   Oxirgi pointer: survey_id = ${lastSurveyId}`);

    } catch (err) {
        console.error('Xatolik:', err.message);
        throw err;
    }
}

// Pointerni reset qilish (kerak bo'lsa)
async function resetPointer() {
    await SyncPointer.updateOne(
        { collection_name: COLLECTION_NAME },
        { last_survey_id: '0', total_synced: 0 },
        { upsert: true }
    );
    console.log('Pointer reset qilindi.');
}

// Asosiy funksiya
async function main() {
    const args = process.argv.slice(2);

    try {
        if (args.includes('--reset')) {
            await resetPointer();
        } else {
            await syncSurveyData();
        }
        process.exit(0);
    } catch (err) {
        console.error('Dastur xatosi:', err);
        process.exit(1);
    }
}

main();
