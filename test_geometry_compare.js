import pool from './startup/dbpg.js';
import mongoose from 'mongoose';
import './startup/db.js';
import House from './models/house.model.js';

async function compare() {
    try {
        // MongoDB dan bitta mavjud gid olish
        setTimeout(async () => {
            const anyMongo = await House.findOne().lean();
            if (!anyMongo) {
                console.log('MongoDB da hech qanday yozuv yo\'q');
                process.exit(1);
            }

            const testGid = anyMongo.gid;
            console.log('Test uchun gid:', testGid);

            // PostgreSQL dan shu gid ni olish
            const pgResult = await pool.query(`
                SELECT
                    gid,
                    LENGTH(geom::text) as pg_length,
                    geom::text as pg_geometry
                FROM admin.all_viloyats_merged
                WHERE gid = $1
                LIMIT 1
            `, [testGid]);

            console.log('\nPostgreSQL:');
            console.log('gid:', pgResult.rows[0].gid);
            console.log('Geometry length:', pgResult.rows[0].pg_length);
            console.log('First 200 chars:', pgResult.rows[0].pg_geometry.substring(0, 200));
            console.log('Last 200 chars:', pgResult.rows[0].pg_geometry.substring(pgResult.rows[0].pg_geometry.length - 200));
            console.log('');

            // MongoDB dan o'sha gid ni olish
            const mongoDoc = anyMongo;

            console.log('MongoDB:');
            console.log('gid:', mongoDoc.gid);
            console.log('Geometry length:', mongoDoc.geometry?.length || 0);
            console.log('First 200 chars:', mongoDoc.geometry?.substring(0, 200) || 'NULL');
            console.log('Last 200 chars:', mongoDoc.geometry?.substring(mongoDoc.geometry.length - 200) || 'NULL');
            console.log('');

            const match = pgResult.rows[0].pg_geometry === mongoDoc.geometry;
            const lengthMatch = pgResult.rows[0].pg_length === mongoDoc.geometry?.length;

            console.log('Exact match:', match);
            console.log('Length match:', lengthMatch);

            if (!match) {
                console.log('\nLength difference:', pgResult.rows[0].pg_length - (mongoDoc.geometry?.length || 0));
            }

            // Eng uzun geometryni tekshirish
            console.log('\n--- Eng uzun geometry tekshiruvi ---');
            const pgLongest = await pool.query(`
                SELECT
                    gid,
                    LENGTH(geom::text) as pg_length
                FROM admin.all_viloyats_merged
                ORDER BY LENGTH(geom::text) DESC
                LIMIT 1
            `);

            const mongoLongest = await House.findOne({ gid: pgLongest.rows[0].gid });

            console.log('PostgreSQL eng uzun gid:', pgLongest.rows[0].gid);
            console.log('PostgreSQL length:', pgLongest.rows[0].pg_length);
            console.log('MongoDB length:', mongoLongest?.geometry?.length || 0);
            console.log('Match:', pgLongest.rows[0].pg_length === (mongoLongest?.geometry?.length || 0));

            process.exit(0);
        }, 2000);

    } catch (err) {
        console.error('Xatolik:', err.message);
        process.exit(1);
    }
}

compare();
