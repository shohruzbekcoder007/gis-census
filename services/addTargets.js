import '../startup/db.js';
import Target from '../models/target.model.js';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addTargets() {
    try {
        console.log('Excel faylni o\'qish boshlandi...');

        // Excel faylni o'qish
        const filePath = path.join(__dirname, 'SVOD_cleaned.xlsx');
        const workbook = xlsx.readFile(filePath);

        // Birinchi sheetni olish
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // JSON formatga o'tkazish
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`Jami ${data.length} ta yozuv topildi.`);
        console.log('Birinchi qator:', data[0]);
        console.log('Barcha ustunlar:', Object.keys(data[0]));

        // Barcha sheetlarni ko'rsatish
        console.log('\nBarcha sheetlar:', workbook.SheetNames);

        // Targetlar massivini tayyorlash
        const targets = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                // Excel ustunlaridan ma'lumotlarni olish (aniq ustun nomlari)
                const target = {
                    region_soato: parseInt(row.region_soato),
                    district_soato: parseInt(row.district_soato),
                    tin: parseInt(row.tin),
                    neighbordhood: String(row.neighbordhood || 'N/A'),
                    position: String(row.position || 'boshqa'),
                    target: parseInt(row.target || 0)
                };

                // Validatsiya
                if (!target.region_soato || !target.district_soato || !target.tin) {
                    errors.push({ row: i + 2, data: row, error: 'Majburiy maydon yo\'q (region_soato, district_soato yoki tin)' });
                    continue;
                }

                targets.push(target);
            } catch (err) {
                errors.push({ row: i + 2, data: row, error: err.message });
            }
        }

        console.log(`\nTayyorlangan targetlar: ${targets.length}`);
        console.log(`Xatolar: ${errors.length}`);

        if (errors.length > 0) {
            console.log('\nXatoli qatorlar:');
            errors.slice(0, 10).forEach(e => {
                console.log(`  Qator ${e.row}: ${e.error}`, e.data);
            });
            if (errors.length > 10) {
                console.log(`  ... va yana ${errors.length - 10} ta xato`);
            }
        }

        if (targets.length === 0) {
            console.log('Qo\'shish uchun target topilmadi!');
            process.exit(1);
        }

        // Namuna ko'rsatish
        console.log('\nBirinchi 3 ta target:');
        targets.slice(0, 3).forEach((t, i) => {
            console.log(`  ${i + 1}:`, t);
        });

        // Database ga qo'shish
        console.log('\nDatabase ga yozish boshlandi...');

        // Avval mavjud targetlarni o'chirish (ixtiyoriy)
        // await Target.deleteMany({});
        // console.log('Eski targetlar o\'chirildi.');

        // Bulk insert
        const result = await Target.insertMany(targets, { ordered: false });

        console.log(`\n✅ ${result.length} ta target muvaffaqiyatli qo'shildi!`);

        process.exit(0);

    } catch (err) {
        console.error('Xatolik:', err.message);

        if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('xlsx')) {
            console.log('\n📦 xlsx paketini o\'rnatish kerak:');
            console.log('   npm install xlsx');
        }

        process.exit(1);
    }
}

addTargets();
