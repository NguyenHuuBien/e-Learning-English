import Joi from "joi";
import { _phoneValidation } from "../utils/validations.js";

export const createValidate = Joi.object({
    // user_id: Joi.string().required(true).messages({
    //     'any.required': 'Thiếu Người làm bài!'
    // }),
    test: Joi.string().required(true).messages({
        'any.required': 'Thiếu Bài Test!'
    }),
    start_time: Joi.string().required(true).messages({
        'any.required': 'Thiếu Thời gian bắt đầu!'
    }),
    end_time: Joi.string().required(true).messages({
        'any.required': 'Thiếu Thời gian kết thúc!'
    }),
    answers: Joi.string().required(true).messages({
        'any.required': 'Thiếu Câu trả lời!'
    }),

})

// export const updateValidate = Joi.object({
//     question_text: Joi.string(),
//     question_type: Joi.string(),
//     options: Joi.string(),
//     correct_answer: Joi.string(),
//     marks: Joi.number(),
//     status: Joi.number().valid(0, 1)
// })