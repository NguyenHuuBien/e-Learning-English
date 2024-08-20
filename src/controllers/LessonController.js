import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../configs/errors.js"
import { uploadFile } from "../middlewares/upload.js"
import Branch from "../models/Branch.js"
import Course from "../models/Course.js"
import Lesson from "../models/Lesson.js"
import User from "../models/User.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/LessonValidations.js"
import { createRegistration, deleteCourse, extractManifestTitle, uploadScormFile } from "./SCORMController.js"
import CourseRegister from "../models/CourseRegister.js"
import { resolve } from "url"

export const create = async ({ body, user, files }) => {
    const validate = await createValidate.validateAsync(body)
    validate.teacher = user._id

    if (files) {
        for (const file of files) {
            const countLesson = await Lesson.countDocuments()
            validate.code = convertCode("LS", countLesson);
            const isUpload = await uploadScormFile(file.path, validate.code)

            const courseTitle = await extractManifestTitle(file.path);
            validate.name = courseTitle;
            await new Promise(resolve => setTimeout(resolve, 10000))
            validate.name_search = convertNameSearch(validate.name);
            const oldUserAdmin = await User.find({
                role: "admin",
                status: 1
            })
            await Promise.all(oldUserAdmin.map(async user => {
                await createRegistration(validate.code, user._id, user.name, user.username)

            }))
            await Lesson.create(validate)
        }
    }
    return true
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldLesson = await Lesson.findById(id)
    if (!oldLesson) throw new NotFoundError("Không tìm thấy Bài giảng!")

    if (file) {
        await deleteCourse(oldLesson.code)
        await uploadScormFile(file.path, oldLesson.code)
        const courseTitle = await extractManifestTitle(file.path);
        validate.name = courseTitle;
        validate.name_search = convertNameSearch(validate.name);
        // const oldRegisterCourse = await CourseRegister.find({
        //     course: oldLesson.course,
        //     status: 1
        // })
        // console.log("aaaaaaaaaaaaaaa", oldRegisterCourse);
        // await Promise.all(oldRegisterCourse.map(async course => {
        //     const oldUser = await User.findById(course.user)
        //     console.log("aaaaaaaaaaaaaaaa", oldLesson.code, course.user, oldUser.name, oldUser.username);
        //     await createRegistration(oldLesson.code, course.user, oldUser.name, oldUser.username)

        // }))

    }
    await Lesson.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Lesson.findById(id)
        .select("-createdAt -updatedAt -name_search")
        .populate("teacher", "name degree")
        .populate("course", "name")
    return result
}

export const list = async ({ query: { name, code, status, teacher, course, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name, code }
    if (q) conditions = search(q)

    if (teacher) conditions.teacher = new mongoose.Types.ObjectId(teacher)
    if (course) conditions.course = new mongoose.Types.ObjectId(course)
    if (status) conditions.status = status

    // const { offset } = getPagination(page, limit)
    const result = await Lesson.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("teacher", "name degree")
        .populate("course", "name")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // const total = await Lesson.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}