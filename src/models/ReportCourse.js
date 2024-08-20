import mongoose from "mongoose";

const reportCourseSchema = mongoose.Schema({
    month: { type: Number },
    year: { type: Number },
    course: { type: mongoose.Schema.ObjectId, ref: "Course" },
    total_money: { type: Number, default: 0 },
    total_register: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false })

const ReportCourse = mongoose.model("ReportCourse", reportCourseSchema)
export default ReportCourse