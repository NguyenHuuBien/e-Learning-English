import mongoose from "mongoose"
import { ExistDataError, NotFoundError, ParamError } from "../configs/errors.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import Question from "../models/Question.js"
import { uploadFile } from "../middlewares/upload.js"
import { createValidate } from "../validations/ResultValidations.js"
import Result from "../models/Result.js"

const _validateAnswer = async (answers, test) => {
    let total_correct = 0, total_incorrect = 0, total_empty, score = 0
    const totalQuestion = await Question.countDocuments({ test: new mongoose.Types.ObjectId(test) })
    await Promise.all(answers.map(async answer => {
        const oldQuestion = await Question.findById(answer.question)
        if (!oldQuestion) throw new NotFoundError("Không tìm thấy câu hỏi trong cơ sở dữ liệu!")
        // if (!answer.answer) total_empty += 1
        const userAnswers = answer.answer
        const correctAnswers = oldQuestion.correct_answer;

        if (userAnswers.length === correctAnswers.length && userAnswers.every(ans => correctAnswers.includes(ans))) {
            total_correct += 1
            score += oldQuestion.marks
        } else {
            total_incorrect += 1
        }
    }))
    total_empty = totalQuestion - total_correct - total_incorrect
    return {
        total_correct, total_incorrect, total_empty, score
    }

}

export const create = async ({ body, user, file, files }) => {
    const validate = await createValidate.validateAsync(body)
    // const oldResult = await Result.findOne({ user: user._id, test: validate.test })
    // if (oldResult) throw new ExistDataError("Bạn đã có kết quả của bài kiểm tra này!")
    validate.answers = JSON.parse(validate.answers);

    const { total_correct, total_incorrect, total_empty, score } = await _validateAnswer(validate.answers, validate.test)
    validate.total_correct = total_correct
    validate.total_incorrect = total_incorrect
    validate.total_empty = total_empty
    validate.score = score
    validate.user = user._id
    const result = await Result.create(validate)
    return result
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Result.findById(id)
        .select("-createdAt -updatedAt")
        .populate("user", "name")
        .populate("test", "name")
        .populate({
            path: 'answers.question',
            model: 'Question'
        })
    return result
}

export const list = async ({ query: { user_id, test, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    // const q = { name: question_text }
    // if (q) conditions = search(q)

    if (test) conditions.test = new mongoose.Types.ObjectId(test)
    conditions.user = new mongoose.Types.ObjectId(user._id)
    if (user_id) conditions.user = new mongoose.Types.ObjectId(user_id)
    // if (status) conditions.status = status

    const { offset } = getPagination(page, limit)
    const result = await Result.find(conditions)
        .select("-createdAt -updatedAt")
        .populate("user", "name")
        .populate("test", "name")
        .populate({
            path: 'answers.question',
            model: 'Question'
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = await Result.countDocuments(conditions)
    return getPaginData(result, total, page)
}