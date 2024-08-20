import { NotFoundError, ParamError } from "../configs/errors.js"
import { uploadFile } from "../middlewares/upload.js"
import Branch from "../models/Branch.js"
import User from "../models/User.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { search } from "../utils/search.js"
import { isObjectId } from "../utils/validations.js"
import { createValidate, updateValidate } from "../validations/UserValidations.js"
import bcrypt from "bcrypt"

export const create = async ({ body, user, file }) => {
    let validate = await createValidate.validateAsync(body)
    //validate account
    const oldUsername = await User.findOne({ username: validate.username })
    if (oldUsername) throw new ParamError("Username này đã tồn tại!")
    validate.password = bcrypt.hashSync(validate.password, 12)
    validate.name_search = convertNameSearch(validate.name)

    const countUser = await User.countDocuments()
    validate.code = convertCode("US", countUser)

    if (file) {
        const img = await uploadFile(file, "avt")
        validate.img = img
    }
    const result = await User.create(validate)
    return result
}

export const update = async ({ params, body, user, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const validate = await updateValidate.validateAsync(body)
    const oldUser = await User.findById(id)
    if (!oldUser) throw new ParamError("Không tìm thấy người dùng!")

    if (validate.name) validate.name_search = convertNameSearch(validate.name)

    if (validate.phone) {
        const oldPhone = await User.findOne({ phone: validate.phone })
        if (oldPhone) throw new ParamError("Số điện thoại này đã tồn tại!")
    }
    if (validate.email && validate.email != oldUser.email) {
        const oldEmail = await User.findOne({ email: validate.email })
        if (oldEmail) throw new ParamError("Email này đã tồn tại!")
    }
    if (validate.password) validate.password = bcrypt.hashSync(validate.password, 12)

    if (file) {
        const img = await uploadFile(file, "avt")
        validate.img = img
    }

    await User.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu ID!!")
    if (!isObjectId(id)) throw new ParamError("Sai ID!")

    const result = await User.findById(id)
        .select("-createdAt -updatedAt -name_search")
    // .populate("center", "name")
    // .populate("branch", "name")
    return result
}

export const list = async ({ query: { name, phone, code, status, limit = 10, page = 1 }, user }) => {
    let conditions = {}
    const q = { name, code }
    if (q) conditions = search(q)

    // if (center) conditions.center = new mongoose.Types.ObjectId(center)
    // if (branch) conditions.branch = new mongoose.Types.ObjectId(branch)
    if (status) conditions.status = status

    const { offset } = getPagination(page, limit)
    const result = await User.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        // .populate("branch", "name")
        // .populate("center", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = await User.countDocuments(conditions)
    return getPaginData(result, total, page)
}