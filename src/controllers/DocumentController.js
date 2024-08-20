import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../configs/errors.js"
import { uploadFile } from "../middlewares/upload.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { isObjectId } from "../utils/validations.js"
import Document from "../models/Document.js"

export const create = async ({ body, user, files }) => {
    if (!body.course) throw new ParamError("Thiếu tên Khóa học!")
    // if (!body.title) throw new NotFoundError("Thiếu Title!")
    if (!files) throw new NotFoundError("Thiếu Tài liệu!")

    if (files) {
        await Promise.all(files.map(async file => {
            const doc = await uploadFile(file, "document")
            await Document.create({ document: doc, course: body.course })
        }))
    }

    return true
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const oldDocument = await Document.findById(id)
    if (!oldDocument) throw new ParamError("Không tồn tại Tài liệu này!")


    if (file) {
        body.document = await uploadFile(file, "document")
    }
    await Document.findByIdAndUpdate(id, body)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Document.findById(id)
        .select("-createdAt -updatedAt")
        .populate("course", "name")
    return result
}

export const list = async ({ query: { status, course, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    // const q = { name, code, description }
    // if (q) conditions = search(q)

    if (course) conditions.course = new mongoose.Types.ObjectId(course)
    if (status) conditions.status = status

    // const { offset } = getPagination(page, limit)
    const result = await Document.find(conditions)
        .select("-createdAt -updatedAt")
        .populate("course", "name")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // const total = await Document.countDocuments(conditions)
    return result
}