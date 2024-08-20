import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";

export const createValidate = Joi.object({
    name: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên Cơ sở!'
    }),
    phone: _phoneValidation,
    address: Joi.string().required(true).messages({
        'any.required': 'Địa chỉ là bắt buộc!'
    }),
    center: Joi.string().required(true).messages({
        'any.required': 'Tên trung tâm là bắt buộc!'
    }),
})

export const updateValidate = Joi.object({
    name: Joi.string(),
    phone: _phoneValidation,
    address: Joi.string(),
})