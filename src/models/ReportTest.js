import mongoose from "mongoose";

const reportTestSchema = mongoose.Schema({
    month: { type: Number },
    year: { type: Number },
    test: { type: mongoose.Schema.ObjectId, ref: "Test" },
    average_marks: { type: Number, default: 0 },
    total_number: { type: Number, default: 0 },
    total_tests: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false })

const ReportTest = mongoose.model("ReportTest", reportTestSchema)
export default ReportTest