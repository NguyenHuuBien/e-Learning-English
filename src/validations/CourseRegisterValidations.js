import Joi from "joi";

export const createValidate = Joi.object({
    course: Joi.string().required(true).messages({
        'any.required': 'Thiếu tên Khóa học!'
    }),
})