import Joi from "joi";

export const createValidate = Joi.object({
    // comment: Joi.string(),
    rate: Joi.number().max(5).messages({
        'number.max': 'Đánh giá không lớn hơn 5',
    }),
    course: Joi.string(),
})

export const updateValidate = Joi.object({
    // comment: Joi.string(),
    rate: Joi.number().max(5).messages({
        'number.max': 'Đánh giá không lớn hơn 5',
    }),
    // like: Joi.number().valid(1, -1),
    status: Joi.number().valid(0, 1)
})