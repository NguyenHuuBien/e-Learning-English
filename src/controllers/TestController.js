import mongoose from "mongoose"
import { ExistDataError, NotFoundError, ParamError } from "../configs/errors.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/TestValidations.js"
import Test from "../models/Test.js"

export const create = async ({ body, user, file, files }) => {
    const validate = await createValidate.validateAsync(body)
    validate.name_search = convertNameSearch(validate.name)

    const oldName = await Test.findOne({ name_search: validate.name_search })
    if (oldName) throw new ExistDataError("Tên bài kiểm tra này đã tồn tại!")
    validate.createBy = user._id
    const result = await Test.create(validate)
    return result
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldTest = await Test.findById(id)

    if (validate.name) {
        validate.name_search = convertNameSearch(validate.name)
        const oldName = await Test.findOne({ name_search: validate.name_search })
        if (oldName && validate.name_search != oldTest.name_search) throw new ExistDataError("Tên bài kiểm tra này đã tồn tại!")
    }

    await Test.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Test.findById(id)
        .select("-createdAt -updatedAt -name_search")
    // .populate("course", "name")
    return result
}

export const list = async ({ query: { name, createBy, status, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name }
    if (q) conditions = search(q)

    // if (course) conditions.course = new mongoose.Types.ObjectId(course)
    if (status) conditions.status = status
    if (createBy) conditions.createBy = createBy

    const { offset } = getPagination(page, limit)
    const result = await Test.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        // .populate("course", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = await Test.countDocuments(conditions)
    return getPaginData(result, total, page)
}