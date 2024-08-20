import mongoose from "mongoose";
import { FORM, RANK_IELST, RANK_TOEIC, TYPE_COURSE } from "../configs/constant.js";

const courseSchema = mongoose.Schema({
    name: { type: String, require: true },
    name_search: { type: String },
    code: { type: String },
    cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    // type: { type: Number, enum: TYPE_COURSE }, //ielts, toeic
    rank: { type: Number, enum: RANK_TOEIC },
    status: { type: Number, default: 3 },
    description: { type: String },
    total_user_vote: { type: Number, default: 0 },
    average_rate: { type: Number, default: 0 },
    img: { type: String },
    purpose: { type: [String] }, //mục đích
    teacher: { type: mongoose.Schema.ObjectId, ref: "User" },
}, { timestamps: true, versionKey: false })

const Course = mongoose.model("Course", courseSchema)
export default Course