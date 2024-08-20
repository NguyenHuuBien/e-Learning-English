import { NotFoundError, ParamError } from "../configs/errors.js"
import { uploadFile } from "../middlewares/upload.js"
import Blog from "../models/Blog.js"
import { getPagination, getPaginData } from "../utils/paging.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/BlogValidations.js"
import { convertNameSearch } from "../utils/convert.js"
import { search } from "../utils/search.js"
import mongoose from "mongoose"

export const uploadPicture = async ({ file }) => {
    const pic = await uploadFile(file, "blog")
    return pic
}
export const create = async ({ body, user, files }) => {
    const validate = await createValidate.validateAsync(body)

    validate.author = user._id
    if (validate.tags) validate.tags = JSON.parse(validate.tags)
    if (validate.title) validate.name_search = convertNameSearch(validate.title)
    const result = await Blog.create(validate)
    return result
}

export const update = async ({ params, body, user, files }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldBog = await Blog.findById(id)
    if (!oldBog) throw new NotFoundError("Không tìm thấy Blog!")
    if (validate.tags) validate.tags = JSON.parse(validate.tags)
    if (validate.title) validate.name_search = convertNameSearch(validate.title)
    await Blog.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Blog.findById(id)
        .select("-createdAt -updatedAt")
        .populate("author", "name")
    return result
}

export const list = async ({ query: { title, status, author, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { title }
    if (q) conditions = search(q)
    conditions.status = 1
    if (author) conditions.author = new mongoose.Types.ObjectId(author)
    if (status) conditions.status = status

    const { offset } = getPagination(page, limit)
    const result = await Blog.find(conditions)
        .select("-createdAt -updatedAt")
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = result.length
    return getPaginData(result, total, page)
}