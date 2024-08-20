import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";
import { ROLES } from "../configs/constant.js";

export const createValidate = Joi.object({
    name: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên Người dùng!'
    }),
    phone: _phoneValidation,
    email: Joi.string(),
    address: Joi.string(),
    sex: Joi.string().valid('male', 'female'),
    birthday: Joi.string(),
    degree: Joi.string(),
    role: Joi.string().valid(...ROLES).messages({
        'any.only': 'Vai trò không hợp lệ!'
    }),
    username: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên tài khoản!'
    }),
    password: Joi.string().required(true).max(8).messages({
        'any.required': 'Thiếu mật khẩu!',
        'string.max': 'Mật khẩu không được vượt quá 8 ký tự!'
    }),
    // center: Joi.string().required(true).messages({
    //     'any.required': 'Tên Trung tâm là bắt buộc!'
    // }),
    // branch: Joi.string().required(true).messages({
    //     'any.required': 'Tên Cơ sở là bắt buộc!'
    // }),
})

export const updateValidate = Joi.object({
    name: Joi.string(),
    username: Joi.string(),
    phone: _phoneValidation,
    password: Joi.string(),
    email: Joi.string(),
    sex: Joi.string(),
    birthday: Joi.string(),
    degree: Joi.string(),
    role: Joi.string(),
    status: Joi.number().valid(0, 1)
})