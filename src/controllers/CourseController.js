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
import { createValidate, updateValidate } from "../validations/CourseValidations.js"
import CourseRegister from "../models/CourseRegister.js"

export const create = async ({ body, user, file }) => {
    const validate = await createValidate.validateAsync(body)
    validate.name_search = convertNameSearch(validate.name)

    const oldCourse = await Course.findOne({ name_search: validate.name_search, status: 1 })
    if (oldCourse) throw new ParamError("Tên Khóa học đã tồn tại!")
    const countCourse = await Course.countDocuments()
    validate.code = convertCode("CO", countCourse)
    // validate.createBy = user._id
    validate.cost = validate.cost - validate.discount < 0 ? 0 : validate.cost - validate.discount
    if (validate.purpose) validate.purpose = validate.purpose.split('\n')
    if (file) {
        const img = await uploadFile(file, "course")
        validate.img = img
    }
    if (validate.teacher) {
        const oldTeacher = await User.findById(validate.teacher)
        if (oldTeacher.role != "teacher") throw new ParamError("Không phải là giáo viên!")
    }
    // if (validate.purpose) validate.purpose = JSON.parse(validate.purpose.replace(/'/g, '"'));

    const result = await Course.create(validate)
    return result
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldCourse = await Course.findById(id)
    if (!oldCourse) throw new NotFoundError("Không tìm thấy Khóa học!")

    if (validate.name) validate.name_search = convertNameSearch(validate.name)

    if (validate.phone) {
        const oldPhone = await Course.findOne({ phone: validate.phone })
        if (oldPhone) throw new ParamError("Số điện thoại này đã tồn tại!")
    }
    // if (validate.purpose) validate.purpose = JSON.parse(validate.purpose.replace(/'/g, '"'));
    if (validate.purpose) validate.purpose = validate.purpose.split('\n')

    if (file) {
        const img = await uploadFile(file, "course")
        validate.img = img
    }

    await Course.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params, user }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const courseRegister = await CourseRegister.findOne({
        user: new mongoose.Types.ObjectId(user._id),
        course: new mongoose.Types.ObjectId(id),
    })
    let result = await Course.findById(id)
        .select("-createdAt -updatedAt -name_search")
        .populate("teacher", "name degree")
        .lean()
    result.isRegister = courseRegister ? 1 : 0
    return result
}

export const list = async ({ query: { name, code, status, teacher, isRegister = 0, limit = 8, page = 1 }, user }) => {
    let conditions = {}
    const q = { name, code }
    if (q) conditions = search(q)

    if (teacher) conditions.teacher = new mongoose.Types.ObjectId(teacher)
    // if (teacher) conditions.teacher = new mongoose.Types.ObjectId(teacher)
    conditions.status = 1
    if (user.role == 'teacher') conditions.status = { $gte: 1, $lte: 3 }
    if (status) conditions.status = status
    const { offset } = getPagination(page, limit)

    const courseRegister = await CourseRegister.find({ user: new mongoose.Types.ObjectId(user._id) })
        .select("user course")
        .populate("course")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // if (isRegister == 1) {
    //     const total = courseRegister.length
    //     return getPaginData(courseRegister, total, page)
    // }

    let result = await Course.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("teacher", "name degree")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    // let total = await Course.countDocuments(conditions)
    const registeredCourseIds = courseRegister.map(cr => cr.course._id.toString());
    if (isRegister == 1) {
        result = result.filter(course => registeredCourseIds.includes(course._id.toString()));
    } 
    else {
        result = result.filter(course => !registeredCourseIds.includes(course._id.toString()));
    }

    const total = result.length
    return getPaginData(result, total, page)

}