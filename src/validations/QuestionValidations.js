import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";
import { FORM, TYPE_COURSE } from "../configs/constant.js";

export const createValidate = Joi.object({
    question_text: Joi.string().required(true).messages({
        'any.required': 'Thiếu câu hỏi!'
    }),
    question_type: Joi.string().required(true).messages({
        'any.required': 'Thiếu Loại câu hỏi!'
    }),
    options: Joi.string().required(true).messages({
        'any.required': 'Thiếu câu trả lời!'
    }),
    correct_answer: Joi.string().required(true).messages({
        'any.required': 'Thiếu câu trả lời đúng!'
    }),
    test: Joi.string().required(true).messages({
        'any.required': 'Thiếu bài Test!'
    }),
    marks: Joi.number().min(0).required(true).messages({
        'any.required': "Thiếu số điểm!",
        'number.min': "Điểm không thể nhỏ hơn 0!"
    }),
})

export const updateValidate = Joi.object({
    question_text: Joi.string(),
    question_type: Joi.string(),
    options: Joi.string(),
    correct_answer: Joi.string(),
    marks: Joi.number(),
    status: Joi.number().valid(0, 1),
})