import pool from '../startup/dbpg.js';

async function checkPostgres() {
    try {
        console.log('PostgreSQL ulanishini tekshirish...\n');

        // Server vaqti
        const timeResult = await pool.query('SELECT NOW() as server_time');
        console.log('Server vaqti:', timeResult.rows[0].server_time);

        // Barcha tablelar ro'yxati
        const tablesQuery = `
            SELECT
                table_schema,
                table_name,
                table_type
            FROM information_schema.tables
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name
        `;
        const tables = await pool.query(tablesQuery);

        console.log(`\nJami ${tables.rows.length} ta table/view topildi:\n`);

        let currentSchema = '';
        tables.rows.forEach(row => {
            if (currentSchema !== row.table_schema) {
                currentSchema = row.table_schema;
                console.log(`\n[${currentSchema}]`);
            }
            const type = row.table_type === 'VIEW' ? '(VIEW)' : '';
            console.log(`  - ${row.table_name} ${type}`);
        });

        console.log('\n\nPostgreSQL ulanishi muvaffaqiyatli!');
        process.exit(0);
    } catch (error) {
        console.error('PostgreSQL xatosi:', error.message);
        process.exit(1);
    }
}

checkPostgres();
