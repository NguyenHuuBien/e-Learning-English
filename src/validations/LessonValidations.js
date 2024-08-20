import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";
import { FORM, TYPE_COURSE } from "../configs/constant.js";

export const createValidate = Joi.object({
    // name: Joi.string().required(true).messages({
    //     'any.required': 'Thiếu tên Bài giảng!'
    // }),
    description: Joi.string(),
    course: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên Khóa học!'
    }),
    // teacher: Joi.string().required(true).messages({
    //     'any.required': 'Thiếu tên Giáo viên!'
    // }),
})

export const updateValidate = Joi.object({
    // name: Joi.string(),
    description: Joi.string(),
    status: Joi.number()

})