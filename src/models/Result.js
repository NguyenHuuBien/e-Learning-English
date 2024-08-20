import mongoose from "mongoose";

const resultSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    score: { type: Number },
    total_correct: { type: Number },
    total_incorrect: { type: Number },
    total_empty: { type: Number },
    answers: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        answer: { type: [String] },
    }]
}, { timestamps: true, versionKey: false });

const Result = mongoose.model('Result', resultSchema);
export default Result