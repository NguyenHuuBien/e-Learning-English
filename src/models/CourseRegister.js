import mongoose from "mongoose";
import { PAYMENT_STATUS } from "../configs/constant.js";

const courseRegisterSchema = mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    course: { type: mongoose.Schema.ObjectId, ref: "Course" },
    payment_status: { type: Number, default: 0, enum: PAYMENT_STATUS },
    paid: { type: Number, default: 0 }, //đã thanh toán
    debt: { type: Number, default: 0 }, // còn nợ
    bill_id: { type: String, require: true },
    date_time: { type: String },
    bank: { type: String },
}, { timestamps: true, versionKey: false })

const CourseRegister = mongoose.model("CourseRegister", courseRegisterSchema)
export default CourseRegister