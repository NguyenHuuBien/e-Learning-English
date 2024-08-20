import mongoose from "mongoose";

const branchSchema = mongoose.Schema({
    name: { type: String },
    name_search: { type: String },
    phone: { type: String },
    code: { type: String },
    address: { type: String },
    status: { type: Number, default: 1 },
    center: { type: mongoose.Schema.ObjectId, ref: 'Center' }
}, { timestamps: true, versionKey: false })

const Branch = mongoose.model("Branch", branchSchema)
export default Branch