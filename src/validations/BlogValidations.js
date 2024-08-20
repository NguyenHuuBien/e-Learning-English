import Joi from "joi";

export const createValidate = Joi.object({
    title: Joi.string().required(true).messages({
        'any.required': "Thiếu tiêu đề!"
    }),
    content: Joi.string(),
    tags: Joi.string(),
})

export const updateValidate = Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    tags: Joi.string(),
    status: Joi.number().valid(0, 1)
})