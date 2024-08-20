import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../configs/errors.js"
import { uploadFile } from "../middlewares/upload.js"
import Branch from "../models/Branch.js"
import Course from "../models/Course.js"
import User from "../models/User.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"

export const _createCourseRegister = async ({ body, user, file }) => {
    const validate = await createValidate.validateAsync(body)

    const oldCourse = await Course.findById(validate.course)
    if (!oldCourse) throw new NotFoundError("Không tồn tại Khóa học này!")




    const result = await Course.create(validate)
    return result
}


// export const get = async ({ params }) => {
//     const { id } = params
//     if (!id) throw new NotFoundError("Thiếu ID!!")
//     if (!isObjectId(id)) throw new ParamError("Sai ID!")

//     const result = await Course.findById(id)
//         .select("-createdAt -updatedAt -name_search")
//         .populate("teacher", "name degree")
//     return result
// }

export const list = async ({ query: { name, code, status, teacher, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name, code }
    if (q) conditions = search(q)

    if (teacher) conditions.teacher = new mongoose.Types.ObjectId(teacher)
    if (status) conditions.status = status

    const { offset } = getPagination(page, limit)
    const result = await Course.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("teacher", "name degree")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = await Course.countDocuments(conditions)
    return getPaginData(result, total, page)
}