import mongoose from "mongoose";
import { ROLES } from "../configs/constant.js";

const userSchema = mongoose.Schema({
    username: { type: String },
    password: { type: String },
    name: { type: String, require: true },
    name_search: { type: String },
    code: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    sex: { type: String },
    birthday: { type: Date },
    status: { type: Number, default: 1 },
    role: { type: String, enum: ROLES, default: "student" },
    img: { type: String },
    // branch: { type: mongoose.Schema.ObjectId, ref: 'Branch' },
    // center: { type: mongoose.Schema.ObjectId, ref: 'Center' },
}, { timestamps: true, versionKey: false })

const User = mongoose.model("User", userSchema)
export default User