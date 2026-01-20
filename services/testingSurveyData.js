import pool from '../startup/dbpg.js';

async function testSurveyData() {
    try {
        console.log('PostgreSQL ga ulanish...');

        const query = `
            SELECT * FROM public.survey_data
            ORDER BY survey_id ASC LIMIT 100
        `;

        const result = await pool.query(query);

        console.log(`Jami ${result.rows.length} ta yozuv topildi.\n`);

        if (result.rows.length > 0) {
            console.log('Ustunlar:', Object.keys(result.rows[0]));
            console.log('\nBirinchi 5 ta yozuv:');
            result.rows.slice(0, 5).forEach((row, i) => {
                console.log(`\n${i + 1}:`, row);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Xatolik:', err.message);
        process.exit(1);
    }
}

testSurveyData();
