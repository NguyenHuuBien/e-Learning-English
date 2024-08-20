import mongoose from "mongoose"

const blogSchema = mongoose.Schema({
    title: { type: String, require: true },
    name_search: { type: String, require: true },
    content: { type: String, require: true },
    author: { type: mongoose.Schema.ObjectId, ref: "User" },
    tags: { type: [String] },
    status: { type: Number, default: 1 }
}, { timestamps: true, versionKey: false })

const Blog = mongoose.model("Blog", blogSchema)
export default Blog