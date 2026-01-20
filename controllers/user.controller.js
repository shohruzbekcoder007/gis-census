import User, { loginValidator } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import _ from 'lodash';

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

        const token = user.generateAuthToken();
        let userInfo = _.pick(user, ['_id', 'name', 'username', 'isAdmin', 'code']);
        return res.header('x-auth-token', token).send({ token, user: userInfo });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Xatolik yuzaga keldi");
    }
};

const getToken = async (req, res) => {
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

        const token = user.generateAuthToken();
        return res.send({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Xatolik yuzaga keldi");
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

    const token = user.generateAuthToken();
    let response = _.pick(user, ['_id', 'username', 'isAdmin', 'psid', 'code'])
    response.role = role;
    return res.header('x-auth-token', token).send(response);
};

export default {
    login,
    getToken,
    getUserInfo
};
