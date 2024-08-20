import mongoose from "mongoose";
import { DAY_OF_WEEK } from "../configs/constant.js";

const scheduleSchema = mongoose.Schema({
    day_of_week: [{
        day: { type: Number, enum: DAY_OF_WEEK },
        start_time: { type: String },
        end_time: { type: String },
    }],
    start_date: { type: String },
    end_date: { type: String },
}, { timestamps: true, versionKey: false })

const Schedule = mongoose.model("Schedule", scheduleSchema)
export default Schedule