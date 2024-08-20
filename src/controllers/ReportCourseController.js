import mongoose from "mongoose";
import CourseRegister from "../models/CourseRegister.js";
import { getDate } from "../utils/convert.js";
import ReportCourse from "../models/ReportCourse.js";
import { NotFoundError } from "../configs/errors.js";
import Course from "../models/Course.js";

export const reportCourse = async (year, month, user) => {
    let { startDate, endDate } = {}

    if (year && month) {
        ({ startDate, endDate } = getDate(year, month));
    }

    const matchCondition = {
        createdAt: { $gte: startDate, $lt: endDate }
    };

    if (user) {
        matchCondition.user = new mongoose.Types.ObjectId(user)
    }

    const courseRegisters = await CourseRegister.aggregate([
        {
            $match: matchCondition
        },
        {
            $group: {
                _id: {
                    course: "$course"
                },
                total_money: { $sum: "$paid" },
            }
        },
        {
            $project: {
                _id: 0,
                course: "$_id.course",
                total_money: 1,
            }
        }
    ]);
    await Promise.all(courseRegisters.map(async rpc => {
        rpc.total_register = await CourseRegister.countDocuments({
            course: new mongoose.Types.ObjectId(rpc.course)
        })
        rpc.month = month
        rpc.year = year
        const oldReportCourse = await ReportCourse.findOne({
            month: month,
            year: year,
            course: new mongoose.Types.ObjectId(rpc.course)
        })
        if (oldReportCourse) {
            oldReportCourse.total_register = rpc.total_register;
            oldReportCourse.total_money = rpc.total_money;
            await oldReportCourse.save();
        } else {
            await ReportCourse.create(rpc);
        }
    }))

    return courseRegisters
}

export const list = async ({ query: { year, month }, user }) => {
    if (!month) throw new NotFoundError("Không tìm thấy Tháng")
    if (!year) throw new NotFoundError("Không tìm thấy Năm")
    await reportCourse(year, month)
    const result = await ReportCourse.find({ year: year, month: month })
        .select("-createdAt -updatedAt")
        .populate("course", "name teacher")
        .sort({ createdAt: -1 })
    if (user.role == "teacher") {
        const listResultFinal = await Promise.all(
            result.map(async course => {
                const isCourse = await Course.findOne({ _id: course.course, teacher: user._id });
                return isCourse ? course : null;
            })
        );

        return listResultFinal.filter(course => course !== null);

    }
    return result
}