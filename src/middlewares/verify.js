import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { loginValidation } from "../validations/VerifyValidations.js"
import { AuthenticationError, NotFoundError, ParamError, SystemError } from "../configs/errors.js"
import User from "../models/User.js"
import { mailPassword, verifyEmail } from "../utils/mail.js"
import UserToken from "../models/UserToken.js"
import { convertCode } from "../utils/convert.js"

export const login = async ({ body, user }) => {
    const validate = await loginValidation.validateAsync(body)
    const oldAccount = await User.findOne({ username: validate.username })

    if (!oldAccount) throw new NotFoundError("Người dùng không tồn tại!")
    if (oldAccount.status == 0) throw new Error("Tài khoản này đã bị khóa!")
    const isPassword = bcrypt.compareSync(validate.password, oldAccount.password)
    if (!isPassword) throw new Error("Password không đúng!")

    const { _id, name, role, email } = oldAccount;
    const accessToken = await _generateToken({ _id, name, role, email }, process.env.JWT_SECRET_KEY, '1d')
    const refreshToken = await _generateToken({ _id, name, role, email }, process.env.JWT_SECRET_REFRESH_KEY, '30d')
    const oldUserToken = await UserToken.findOne({ userId: _id })
    await new UserToken({ userId: _id, token: refreshToken }).save();
    if (oldUserToken) await oldUserToken.deleteOne()
    // refreshTokens.push(refreshToken)
    return { user: { _id, name, role, email }, accessToken, refreshToken }
}

export const verifyToken = (rolesCheck = []) => {
    return async (req, res, next) => {
        const { authorization } = req.headers
        if (!authorization) next(new AuthenticationError("Bạn chưa đăng nhập!"))
        const accessToken = authorization.replace("Bearer ", "")

        try {
            const info = jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, payload) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        // Xử lý trường hợp token đã hết hạn
                        return next(new AuthenticationError('Bạn chưa đăng nhập!'));
                    } else {
                        return next(err);
                    }
                } else {
                    return payload
                }
            });

            //check roles
            let { _id, name, role, email } = info

            req['user'] = info
            role = [role]
            if (!_id || !name || !role) return next(new Error("Dữ liệu Login không đúng!"))
            const isAdmin = role.includes("admin")
            if (isAdmin) return next()
            if (rolesCheck.length > 0) {
                let check = false
                for (let role of rolesCheck) {
                    if (role.includes(role)) check = true
                    // break
                }
                if (!check) return next(new Error("Bạn không có quyền chỉnh sửa!"))
            }
        } catch (error) {
            return next(new AuthenticationError("Bạn chưa đăng nhập!"))
        }

        next()
    }
}


export const forgotPassword = async ({ body }) => {
    let oldUsername = await User.findOne({ username: body.username })

    if (!oldUsername) throw new ParamError("Tài khoản này không tồn tại!")
    let newPassword = crypto.randomBytes(4).toString('hex');
    await mailPassword(oldUsername.email, oldUsername.username, newPassword)
    newPassword = bcrypt.hashSync(newPassword, 12)
    await oldUsername.updateOne({ password: newPassword })
    return true
}
export const registerAccount = async ({ body }) => {
    //name,username, password, email
    if (!body.name || !body.username || !body.password || !body.email || !body.confirmPass) throw new NotFoundError("Bạn điền thiếu thông tin!")
    if (body.password !== body.confirmPass) throw new Error("Password không trùng nhau!")
    let oldEmail = await User.findOne({ email: body.email })

    if (oldEmail) throw new ParamError("Email này đã được đăng ký!")
    let oldUsername = await User.findOne({ Username: body.username })

    if (oldUsername) throw new ParamError("Username này đã được đăng ký!")
    // let newPassword = crypto.randomBytes(4).toString('hex');
    await verifyEmail(body.email, body.username, body.password)
    body.password = bcrypt.hashSync(body.password, 12)
    const totalUser = await User.countDocuments()
    body.code = convertCode("US", totalUser)
    const result = await User.create(body)
    return result
}

const _generateToken = async ({ _id, name, role, email }, key, exp) => {
    const oldUser = { _id, name, role, email }
    const token = await new Promise((resolve, reject) => {
        jwt.sign(oldUser, key, { expiresIn: exp }, (error, token) => {
            if (error) return reject(error)

            return resolve(token)
        })
    })
    return token
}

export const verifyRefreshToken = async ({ header }) => {
    try {
        const { authorization } = header;
        if (!authorization) throw new AuthenticationError("Bạn chưa đăng nhập!");

        const refreshToken = authorization.replace("Bearer ", "");

        const oldUserToken = await UserToken.findOne({ token: refreshToken });
        if (!oldUserToken) throw new Error("Lỗi refeshToken");

        const tokenDetails = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_KEY);
        const accessToken = await _generateToken(tokenDetails, process.env.JWT_SECRET_KEY, "15m")
        return { user: tokenDetails, accessToken }
    } catch (error) {
        throw new SystemError(error);
    }
};

export const deleteRefreshToken = async ({ header }) => {
    try {
        const { authorization } = header;
        if (!authorization) throw new AuthenticationError("Bạn chưa đăng nhập!");

        const refreshToken = authorization.replace("Bearer ", "");
        await UserToken.findOneAndDelete({ token: refreshToken })
        return { message: "Logout Thành công" }
    } catch (err) {
        throw new SystemError(err);
    }
}