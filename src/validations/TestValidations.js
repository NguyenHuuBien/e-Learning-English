import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";
import { FORM, TYPE_COURSE } from "../configs/constant.js";

export const createValidate = Joi.object({
    name: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên bài kiểm tra!'
    }),
    description: Joi.string(),
    // course: Joi.string(),
    duration: Joi.number().required(true).messages({
        'any.required': "Thiếu khoảng thời gian!",
    }),
    // total_marks: Joi.number().required(true).min(0).max(1000).messages({
    //     'any.required': "Thiếu Số điểm tối đa!",
    //     'any.min': "Số điểm không được bé hơn 0!",
    //     'any.max': "Số điểm không được lớn hơn 1000!",
    // }),
})

export const updateValidate = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    status: Joi.number().valid(0, 1),
    duration: Joi.number().messages({
        'any.required': "Thiếu khoảng thời gian!",
    }),
    // total_marks: Joi.number().min(0).max(1000).messages({
    //     'any.required': "Thiếu Số điểm tối đa!",
    //     'any.min': "Số điểm không được bé hơn 0!",
    //     'any.max': "Số điểm không được lớn hơn 1000!",
    // }),
})