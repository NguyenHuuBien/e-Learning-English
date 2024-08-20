import mongoose from "mongoose";
import Result from "../models/Result.js";
import { getDate } from "../utils/convert.js";
import { NotFoundError } from "../configs/errors.js";
import ReportTest from "../models/ReportTest.js";

export const reportTest = async (year, month, user) => {
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

    const result = await Result.aggregate([
        {
            $match: matchCondition
        },
        {
            $group: {
                _id: {
                    test: "$test"
                },
                total_number: { $sum: "$score" },
                total_tests: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                test: "$_id.test",
                total_number: 1,
                total_tests: 1,
                average_marks: { $divide: ["$total_number", "$total_tests"] },
            }
        }
    ]);
    await Promise.all(result.map(async element => {
        element.month = month
        element.year = year
        element.average_marks = element.average_marks.toFixed(1)

        const oldReportTest = await ReportTest.findOne({
            month: month,
            year: year,
            test: new mongoose.Types.ObjectId(element.test)
        })
        if (oldReportTest) {
            await ReportTest.findOneAndUpdate({ test: element.test }, element)
        } else {
            await ReportTest.create(element);
        }
    }))

    return result
}

export const list = async ({ query: { year, month }, user }) => {
    if (!month) throw new NotFoundError("Không tìm thấy Tháng")
    if (!year) throw new NotFoundError("Không tìm thấy Năm")
    await reportTest(year, month)
    const result = await ReportTest.find({ year: year, month: month })
        .select("-createdAt -updatedAt")
        .populate("test", "name createBy")
        .sort({ createdAt: -1 })
    const listResultFinal = await Promise.all(
        result.map(async test => {
            const isResult = await Result.findOne({ user: user._id, test: test.test });
            return isResult ? test : null;
        })
    );
    return listResultFinal.filter(test => test !== null);
}