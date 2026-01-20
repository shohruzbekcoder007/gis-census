import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.MONGO_URI || 'mongodb://localhost/gis-census';

mongoose.connect(db)
    .then(() => console.log(`MongoDBga ulanish hosil qilindi...`))
    .catch(err => console.error(`MongoDBga ulanish vaqtida xato ro'y berdi...`, err));
