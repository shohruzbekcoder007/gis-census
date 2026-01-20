import User, { loginValidator } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    try {
        const { error } = loginValidator(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send('Foydalanuvchi topilmadi');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).send('Parol noto\'g\'ri');
        }

        const { accessToken, refreshToken } = user.generateTokens();
        user.refreshToken = refreshToken;
        await user.save();
        
        let userInfo = _.pick(user, ['_id', 'name', 'username', 'isAdmin', 'code']);
        return res.header('x-auth-token', accessToken).send({ accessToken, refreshToken, user: userInfo });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Xatolik yuzaga keldi");
    }
};



const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send('Refresh token topilmadi');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).send('Yaroqsiz refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = user.generateTokens();
        user.refreshToken = newRefreshToken;
        await user.save();

        res.send({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(403).send('Yaroqsiz refresh token');
    }
};

const getUserInfo = async (req, res) => {

    const { _id, code } = _.pick(req.user, ['_id', 'isAdmin', 'code'])

    const codeLength = code.length;

    let role;
    if (codeLength === 4) {
        role = 'region';
    }
    if (codeLength === 7) {
        role = 'district';
    }
    if (code == 17) {
        role = 'republic';
    }

    
    let user = await User.findById(_id);
    if (!user)
        return res.status(400).send('Foydalanuvchi topilmadi');

    let response = _.pick(user, ['_id', 'username', 'isAdmin', 'psid', 'code'])
    response.role = role;
    return res.send(response);
};

export default {
    login,
    refreshToken,
    getUserInfo
};