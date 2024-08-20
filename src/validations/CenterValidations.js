import Joi from "joi"

export const createValidate = Joi.object({
    name: Joi.string().required(true),
    logo: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    owner: Joi.string(),
})