import mongoose from "mongoose";

const documentSchema = mongoose.Schema({
    title: { type: String },
    document: { type: String },
    status: { type: Number, default: 1 },
    course: { type: mongoose.Schema.ObjectId, ref: "Course" },
}, { timestamps: true, versionKey: false })

const Document = mongoose.model("Document", documentSchema)
export default Document