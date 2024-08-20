//bài giảng
import mongoose from "mongoose";

const lessonChema = mongoose.Schema({
    code: { type: String, require: true },
    name: { type: String, require: true }, //là title
    name_search: { type: String },
    status: { type: Number, default: 1 },
    description: { type: String },
    course: { type: mongoose.Schema.ObjectId, ref: "Course" },
    teacher: { type: mongoose.Schema.ObjectId, ref: "User" },
}, { timestamps: true, versionKey: false })

const Lesson = mongoose.model("Lesson", lessonChema)
export default Lesson