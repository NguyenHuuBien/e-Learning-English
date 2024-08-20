import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";
import { FORM, TYPE_COURSE } from "../configs/constant.js";

export const createValidate = Joi.object({
    name: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên Khóa học!'
    }),
    discount: Joi.number().min(0).messages({
        'number.min': 'Giám giá lớn hơn 0',
    }),
    cost: Joi.number().min(0).messages({
        'number.min': 'Giám giá lớn hơn 0',
    }),
    // type: Joi.number().valid(...Object.values(TYPE_COURSE)).messages({
    //     'any.only': 'Loại khóa học không hợp lệ!'
    // }),
    // form: Joi.number().valid(...FORM).messages({
    //     'any.only': 'Hình thức học không hợp lệ!'
    // }),
    description: Joi.string(),
    img: Joi.string(),
    rank: Joi.number(),
    // schedule: Joi.string(),
    teacher: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên Giáo viên!'
    }),
    // createBy: Joi.string().required(true).messages({
    //     'any.required': 'Thiếu tên Giáo viên!'
    // }),
    purpose: Joi.string()
})

export const updateValidate = Joi.object({
    name: Joi.string(),
    discount: Joi.string().min(0).max(100).messages({
        'number.min': 'Giám giá lớn hơn 0%',
        'number.max': 'Giảm giá nhỏ hơn 100%'
    }),
    cost: Joi.number().min(0).messages({
        'number.min': 'Giám giá lớn hơn 0',
    }),
    description: Joi.string(),
    img: Joi.string(),
    status: Joi.number().valid(0, 1, 2, 3),
    // type: Joi.number(),
    purpose: Joi.string(),
    rank: Joi.number(),

})