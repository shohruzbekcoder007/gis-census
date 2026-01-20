import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export default function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token)
        return res.status(401).send('Token bo\'lmaganligi sababli murojaat rad etildi');

    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = decoded;
        next();
    }
    catch (ex) {
        return res.status(400).send('Yaroqsiz token');
    }
}