import mongoose from "mongoose";

const testQuestionSchema = mongoose.Schema({
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    questions: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }
    }],
});

const TestQuestion = mongoose.model('TestQuestion', testQuestionSchema);
export default TestQuestion