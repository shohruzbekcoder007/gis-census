import pool from '../startup/dbpg.js';

async function checkPostgres() {
    try {
        console.log('PostgreSQL ulanishini tekshirish...\n');

        // Oddiy query
        const timeResult = await pool.query('SELECT NOW() as server_time');
        console.log('Server vaqti:', timeResult.rows[0].server_time);

        // Admin jadvalidan ma'lumot olish
        const result = await pool.query('SELECT COUNT(*) as count FROM admin.v_admin_lvl_2');
        console.log('admin.v_admin_lvl_2 jadvaldagi yozuvlar soni:', result.rows[0].count);

        // Namuna ma'lumotlar
        const sample = await pool.query('SELECT id, code, name_uz FROM admin.v_admin_lvl_2 LIMIT 5');
        console.log('\nNamuna ma\'lumotlar:');
        sample.rows.forEach(row => {
            console.log(`  - ${row.id}: ${row.code} - ${row.name_uz}`);
        });

        console.log('\nPostgreSQL ulanishi muvaffaqiyatli!');
        process.exit(0);
    } catch (error) {
        console.error('PostgreSQL xatosi:', error.message);
        process.exit(1);
    }
}

checkPostgres();
