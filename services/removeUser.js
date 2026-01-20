import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.MONGO_URI || 'mongodb://localhost/gis-census';

const removeUser = async () => {
    try {
        await mongoose.connect(db);
        console.log('MongoDBga ulanish hosil qilindi...');

        const args = process.argv.slice(2);
        if (args.length < 1) {
            console.error('Usage: node removeUser.js <username>');
            return;
        }

        const [username] = args;

        const user = await User.findOneAndDelete({ username });

        if (user) {
            console.log('Foydalanuvchi muvaffaqiyatli o\'chirildi:', user);
        } else {
            console.log('Foydalanuvchi topilmadi.');
        }

    } catch (err) {
        console.error('Xatolik:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDBdan uzildi.');
    }
};

removeUser();
