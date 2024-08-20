import { NotFoundError, ParamError } from "../configs/errors.js"
import { uploadFile } from "../middlewares/upload.js"
import Branch from "../models/Branch.js"
import Course from "../models/Course.js"
import User from "../models/User.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/CourseValidations.js"

export const create = async ({ body, user, file }) => {
    const validate = await createValidate.validateAsync(body)
    validate.name_search = convertNameSearch(validate.name)

    const oldCourse = await Course.findOne({ name_search: validate.name_search })
    if (oldCourse) throw new ParamError("Tên Khóa học đã tồn tại!")
    const countCourse = await Course.countDocuments()
    validate.code = convertCode("CO", countCourse)
    validate.createBy = user._id

    if (file) {
        const img = await uploadFile(file, "course")
        validate.img = img
    }
    if (validate.teacher) {
        const oldTeacher = await User.findById(validate.teacher)
        if (oldTeacher.role != "teacher") throw new ParamError("Không phải là giáo viên!")
    }

    const result = await Course.create(validate)
    return result
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldCourse = await Course.findById(id)

    if (validate.name) {
        validate.name_search = convertNameSearch(validate.name)
        if (validate.name_search == oldCourse.name_search) throw new ParamError("Tên Cơ sở này đã tồn tại!")
    }

    if (validate.phone) {
        const oldPhone = await Course.findOne({ phone: validate.phone })
        if (oldPhone) throw new ParamError("Số điện thoại này đã tồn tại!")
    }

    if (file) {
        const img = await uploadFile(file, "course")
        validate.img = img
    }

    await Course.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Course.findById(id)
        .select("-createdAt -updatedAt -name_search")
        .populate("teacher", "name degree")
    return result
}

export const list = async ({ query: { name, code, status, teacher, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name, code, description }
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