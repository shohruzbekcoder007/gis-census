import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.PG_USER || 'gis_user',
    host: process.env.PG_HOST || '172.16.8.76',
    database: process.env.PG_DATABASE || 'gis_db',
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
    max: 20, // maksimal connection pool hajmi
    idleTimeoutMillis: 30000, // connection 30 soniya ishlatilmasa yopiladi
    connectionTimeoutMillis: 2000, // connection kutish vaqti
});

// Connection test
pool.on('connect', () => {
    console.log('PostgreSQL ga ulanish hosil qilindi...');
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection xatosi:', err);
    process.exit(-1);
});

// Test connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL bilan muvaffaqiyatli bog\'lanish o\'rnatildi!');
        const result = await client.query('SELECT NOW()');
        console.log('Database vaqti:', result.rows[0].now);
        client.release();
    } catch (err) {
        console.error('PostgreSQL ga ulanish vaqtida xato ro\'y berdi:', err.message);
        process.exit(1);
    }
};

testConnection();

export default pool;