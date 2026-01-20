import Joi from 'joi';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    code: {
        type: String,
        maxlength: 50,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
});


userSchema.methods.generateTokens = function () {
    const accessToken = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, code: this.code }, process.env.JWT_PRIVATE_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ _id: this._id }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

const User = mongoose.model('User', userSchema);

const loginValidator = user => {
    const schema = Joi.object({
        username: Joi.string().min(2).max(255).required(),
        password: Joi.string().min(2).max(255).required()
    });
    return schema.validate(user);
}

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    code: Joi.string().max(50).required(),
    username: Joi.string().min(2).max(255).required(),
    password: Joi.string().min(2).max(255).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

export { validateUser, loginValidator };
export default User;