import mongoose from "mongoose";

const evaluateSchema = mongoose.Schema({
    // commnent: { type: String },
    rate: { type: Number, default: 0 },
    status: { type: Number, default: 1 },
    course: { type: mongoose.Schema.ObjectId, ref: "Course" },
    student: { type: mongoose.Schema.ObjectId, ref: "User" },
}, { timestamps: true, versionKey: false })

const Evaluate = mongoose.model("Evaluate", evaluateSchema)
export default Evaluate