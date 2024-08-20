import mongoose from "mongoose";

const centerSchema = mongoose.Schema({
    name: { type: String, require: true },
    name_search: { type: String, require: true },
    code: { type: String, unique: true },
    logo: { type: String },
    phone: { type: String, require: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: { type: String },
    status: { type: Number, default: 1 },
}, { timestamps: true, versionKey: false })

const Center = mongoose.model("Center", centerSchema)
export default Center