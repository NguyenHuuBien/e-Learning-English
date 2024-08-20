import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../configs/errors.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/QuestionValidations.js"
import Question from "../models/Question.js"
import { uploadFile } from "../middlewares/upload.js"
import * as Upload from "../middlewares/upload.js"
import Test from "../models/Test.js"


const questionUpload = async (files) => {
    const validate = {
        image_file: [],
        audio_file: ""
    }
    await Promise.all(files.map(async file => {
        if (file.mimetype.startsWith("image")) validate.image_file.push(await uploadFile(file, "image"))
        if (file.mimetype.startsWith("audio")) validate.audio_file = await uploadFile(file, "audio")
    }))
    return validate
}

export const create = async ({ body, user, file, files }) => {
    let validate = await createValidate.validateAsync(body);
    if (files) {
        const listFile = await questionUpload(files)
        validate = { ...validate, ...listFile }
    }
    if (validate.options) validate.options = JSON.parse(validate.options)
    if (validate.correct_answer) validate.correct_answer = JSON.parse(validate.correct_answer)

    if (validate.question_text) validate.name_search = convertNameSearch(validate.question_text);
    const countQuestions = await Question.countDocuments();

    validate.code = convertCode("QS", countQuestions);
    validate.create_by = user._id;
    const oldTest = await Test.findById(validate.test)
    if (!oldTest) throw new NotFoundError("Không tìm thấy bài thi này!")
    oldTest.total_marks += validate.marks;
    await oldTest.save();
    const result = await Question.create(validate);

    return result
}

export const update = async ({ params, body, user, files }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    let validate = await updateValidate.validateAsync(body)
    const oldQuestion = await Question.findById(id)

    if (!oldQuestion) throw new NotFoundError("Không tìm thấy Câu hỏi")
    if (validate.question_text) validate.name_search = convertNameSearch(validate.question_text)

    if (validate.question_text) validate.question_text_search = convertNameSearch(validate.question_text)
    if (validate.options) validate.options = JSON.parse(validate.options.replace(/'/g, '"'));
    if (validate.correct_answer) validate.correct_answer = JSON.parse(validate.correct_answer.replace(/'/g, '"'));

    if (files) {
        const listFile = await questionUpload(files)
        validate = { ...validate, ...listFile }
    }
    const oldTest = await Test.findOne(oldQuestion.test)
    if (!oldTest) throw new NotFoundError("Không tìm thấy bài thi này!")
    const totalMarks = await Question.aggregate([
        { $match: { test: new mongoose.Types.ObjectId(oldQuestion.test), status: 1 } }, // Lọc các câu hỏi theo testId
        { $group: { _id: null, totalMarks: { $sum: "$marks" } } } // Tính tổng các điểm marks
    ]);

    oldTest.total_marks = totalMarks.length > 0 ? totalMarks[0].totalMarks : 0;
    await oldTest.save()

    await Question.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await Question.findById(id)
        .select("-createdAt -updatedAt -name_search")
        .populate("test", "name")
        .populate("create_by", "name")
    return result
}

export const list = async ({ query: { question_text, status, test, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name: question_text }
    if (q) conditions = search(q)

    if (test) conditions.test = new mongoose.Types.ObjectId(test)
    if (status) conditions.status = status

    // const { offset } = getPagination(page, limit)
    const result = await Question.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("test", "name")
        .populate("create_by", "name")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // const total = await Question.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}