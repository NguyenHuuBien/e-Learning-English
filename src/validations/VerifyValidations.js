import Joi from "joi"

export const loginValidation = Joi.object({
    username: Joi.string(),
    password: Joi.string(),
})