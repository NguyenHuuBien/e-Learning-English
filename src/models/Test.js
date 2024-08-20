import mongoose from "mongoose";

const testSchema = mongoose.Schema({
    name: { type: String, required: true },
    name_search: { type: String },
    description: { type: String },
    duration: { type: Number, required: true }, //khoảng thời gian (nhập số phút)
    total_marks: { type: Number, required: true, default: 0 },
    status: { type: Number, default: 1 },
    // course: { type: mongoose.Schema.ObjectId, ref: "Course" },
    createBy: { type: String, require: true }
}, { timestamps: true, versionKey: false });

const Test = mongoose.model('Test', testSchema);
export default Test