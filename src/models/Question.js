import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
    code: { type: String },
    question_text: { type: String },
    name_search: { type: String },
    audio_file: { type: String, default: "" },
    image_file: { type: [String] },
    question_type: { type: String, required: true },
    options: { type: [String] },
    correct_answer: { type: [String] },
    marks: { type: Number, required: true },
    status: { type: Number, default: 1 },
    create_by: { type: mongoose.Schema.ObjectId, ref: "User" },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
}, { timestamps: true, versionKey: false });

const Question = mongoose.model('Question', questionSchema);
export default Question