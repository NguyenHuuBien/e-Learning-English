import { ParamError } from "../configs/errors.js"
import Center from "../models/Center.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { uploadFile } from "../middlewares/upload.js"
import { createValidate } from "../validations/CenterValidations.js"

export const create = async ({ body, user, file }) => {
    const validate = await createValidate.validateAsync(body)
    validate.name_search = convertNameSearch(validate.name)

    const oldCenter = await Center.findOne({ name_search: validate.name_search })
    if (oldCenter) throw new ParamError("Tên trung tâm đã tồn tại!")
    if (file) {
        const img = await uploadFile(file, "avt")
        validate.img = img
    }
    const countCenter = await Center.countDocuments()
    validate.code = convertCode("CT", countCenter)
    const result = await Center.create(validate)
    return result
}

export const list = async () => {
    const result = await Center.find({})
    return result
}