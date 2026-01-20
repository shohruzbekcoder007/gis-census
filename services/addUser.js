import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User, { validateUser } from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.MONGO_URI || 'mongodb://localhost/gis-census';

const addUser = async () => {
    try {
        await mongoose.connect(db);
        console.log('MongoDBga ulanish hosil qilindi...');

        const args = process.argv.slice(2);
        if (args.length < 4) {
            console.error('Usage: node addUser.js <name> <username> <password> <code>');
            return;
        }

        const [name, username, password, code] = args;

        const { error } = validateUser({ name, username, password, code });
        if (error) {
            console.error('Validation error:', error.details[0].message);
            return;
        }

        let user = await User.findOne({ username });
        if (user) {
            console.error('Bu foydalanuvchi allaqachon mavjud.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            username,
            password: hashedPassword,
            code
        });

        await user.save();

        console.log('Foydalanuvchi muvaffaqiyatli qo\'shildi:', user);

    } catch (err) {
        console.error('Xatolik:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDBdan uzildi.');
    }
};

addUser();
