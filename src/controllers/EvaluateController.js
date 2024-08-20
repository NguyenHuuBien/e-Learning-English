import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../configs/errors.js"
import Course from "../models/Course.js"
import CourseRegister from "../models/CourseRegister.js"
import Evaluate from "../models/Evaluate.js"
import { getPagination, getPaginData } from "../utils/paging.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/EvaluateValidations.js"

export const create = async ({ body, user }) => {
    const validate = await createValidate.validateAsync(body)
    const oldCourse = await Course.findById(validate.course)
    if (!oldCourse) throw new NotFoundError("Không tìm thấy Khóa học")

    const registed = await CourseRegister.findOne({ course: validate.course, user: user._id })

    if (!registed) throw new ParamError("Bạn không có quyền Đánh giá")

    validate.student = user._id

    let oldEvaluate = await Evaluate.findOne({ student: user._id, course: validate.course })

    if (oldEvaluate) {
        oldEvaluate.rate = validate.rate
        await oldEvaluate.save()
        // return oldEvaluate
    } else {
        oldEvaluate = await Evaluate.create(validate)
    }
    if (validate.rate) {
        // oldCourse.total_user_vote += 1
        oldCourse.total_user_vote = await Evaluate.countDocuments({ course: validate.course })

        const result = await Evaluate.aggregate([
            {
                $group: {
                    _id: "$course",
                    totalRate: { $sum: "$rate" }
                }
            }
        ]);

        oldCourse.average_rate = (result[0].totalRate / oldCourse.total_user_vote || 1).toFixed(1);

        await oldCourse.save()
    }
    return oldEvaluate
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldEvaluate = await Evaluate.findById(id)
    if (!oldEvaluate) throw new NotFoundError("Không tìm thấy Đánh giá này")
    if (validate.rate) {
        const oldCourse = await Course.findById(oldEvaluate.course)
        oldCourse.total_user_vote += 1
        oldCourse.average_rate = ((oldCourse.average_rate * (oldCourse.total_user_vote - 1)) + validate.rate) / oldCourse.total_user_vote
        await oldCourse.save()
    }

    await Evaluate.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Evaluate.findById(id)
        .select("-createdAt -updatedAt")
        .populate("course", "name")
        .populate("student", "name")
    return result
}

export const list = async ({ query: { status, course, limit = 10, page = 1 }, user }) => {
    let conditions = {}

    if (course) conditions.course = new mongoose.Types.ObjectId(course)
    conditions.status = 1
    conditions.student = user._id

    const { offset } = getPagination(page, limit)
    const result = await Evaluate.find(conditions)
        .select("-createdAt -updatedAt")
        .populate("course", "name")
        .populate("student", "name")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // const total = result.length
    // return getPaginData(result, total, page)
    return result
}