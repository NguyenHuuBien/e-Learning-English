import Joi from "joi";
import mongoose from "mongoose";

export const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/, "phone")
    .min(6)
    .max(15)
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const isObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
}