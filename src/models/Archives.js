//kho tài liệu
// import mongoose from "mongoose";
// import { FORM, TYPE_COURSE } from "../configs/constant";

// const courseSchema = mongoose.Schema({
//     name: { type: String, require: true },
//     name_search: { type: String },
//     cost: { type: Number },
//     discount: { type: Number },
//     type: { type: String, enum: TYPE_COURSE },
//     form: { type: String, enum: FORM },
//     status: { type: Number, default: 1 },
//     description: { type: String },
//     total_user_vote: { type: Number },
//     average_rate: { type: Number },
//     schedule: { type: mongoose.Schema.ObjectId, ref: "Schedule" },
//     teacher: { type: mongoose.Schema.ObjectId, ref: "Teacher" },
//     branch: { type: mongoose.Schema.ObjectId, ref: "Branch" },
// }, { timestamps: true, versionKey: false })

// const Course = mongoose.model("Course", courseSchema)
// export default Course