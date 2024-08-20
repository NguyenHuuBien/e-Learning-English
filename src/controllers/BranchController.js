import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../configs/errors.js"
import Branch from "../models/Branch.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/BranchValidations.js"

export const create = async ({ body, user }) => {
    const validate = await createValidate.validateAsync(body)
    validate.name_search = convertNameSearch(validate.name)

    const oldBranch = await Branch.findOne({ name_search: validate.name_search })
    if (oldBranch) throw new ParamError("Tên Cơ sở đã tồn tại!")
    const countBranch = await Branch.countDocuments()
    validate.code = convertCode("BR", countBranch)
    const result = await Branch.create(validate)
    return result
}

export const update = async ({ params, body, user }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldBranch = await Branch.findById(id)

    if (validate.name) {
        validate.name_search = convertNameSearch(validate.name)
        if (validate.name_search == oldBranch.name_search) throw new ParamError("Tên Cơ sở này đã tồn tại!")
    }

    if (validate.phone) {
        const oldPhone = await Branch.findOne({ phone: validate.phone })
        if (oldPhone) throw new ParamError("Số điện thoại này đã tồn tại!")
    }

    await Branch.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Branch.findById(id)
        .select("-createdAt -updatedAt -name_search")
        .populate("center", "name")
    return result
}

export const list = async ({ query: { name, phone, status, center, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name }
    if (q) conditions = search(q)

    if (center) conditions.center = new mongoose.Types.ObjectId(center)
    if (status) conditions.status = status

    const { offset } = getPagination(page, limit)
    const result = await Branch.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("center", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = await Branch.countDocuments(conditions)
    return getPaginData(result, total, page)
}