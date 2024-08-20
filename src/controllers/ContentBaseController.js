import { NotFoundError } from "../configs/errors.js";
import Course from "../models/Course.js";
import CourseRegister from "../models/CourseRegister.js";
import TfIdf from 'node-tfidf';

// Hàm để tạo đặc trưng kết hợp
async function combineFeatures(course) {
    const teacher = course.teacher ? course.teacher.toString() : '';

    let result = `${course.purpose.join(', ')} ${teacher} ${course.description}`;
    result = result.replace(/"/g, '').replace(/,/g, ' ');
    return result
}

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + (val || 0) * (val || 0), 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Endpoint để gợi ý khóa học
export const abc = async ({ user }) => {
    const userId = user._id;

    if (!userId) {
        throw new Error('User ID is missing');
    }

    // Lấy lịch sử đăng ký khóa học của người dùng
    let listCourseRegisters = await CourseRegister.find({ user: userId }).limit(3);
    const courseRegisters = []
    listCourseRegisters = await Promise.all(
        listCourseRegisters.map(async (courseRegister) => {
            const course = await Course.findOne({ _id: courseRegister.course, status: 1 });
            if (course) courseRegisters.push(courseRegister)
        })
    );
    console.log('AAAAAAAAAAAAAAAA', courseRegisters);

    if (courseRegisters.length === 0) {
        return await Course.find({ status: 1 })
            .sort({ average_rate: -1, createdAt: -1 })
            .limit(5);
    }

    // Lấy tất cả các khóa học có status bằng 1
    const courses = await Course.find({ status: 1 });

    // Tạo TF-IDF vectorizer
    const tfidf = new TfIdf();
    const courseFeatures = await Promise.all(courses.map(course => combineFeatures(course)));
    const registeredCourses = await Promise.all(courseRegisters.map(async register => {
        const course = await Course.findById(register.course);
        return combineFeatures(course);
    }));
    console.log("courseFeatures", courseFeatures);
    console.log("registeredCourses", registeredCourses);



    // Thêm tài liệu vào TF-IDF
    courseFeatures.concat(registeredCourses).forEach(features => {
        // Chuyển đổi văn bản thành chữ thường trước khi thêm
        const lowerCaseFeatures = features.toLowerCase();
        tfidf.addDocument(lowerCaseFeatures);
    });
    console.log("registeredCourses", courseFeatures);

    // Hồ sơ người dùng dựa trên lịch sử đăng ký khóa học
    const userCourseIds = courseRegisters.map(register => register.course.toString());

    const userProfile = [];

    // Tạo vector cho hồ sơ người dùng
    courses.forEach((course, index) => {
        if (userCourseIds.includes(course._id.toString())) {
            const terms = tfidf.listTerms(index);
            console.log("Terms and TF-IDF values for course index", index);
            terms.forEach(term => {
                console.log(`Term: ${term.term}, TF-IDF: ${term.tfidf}`);
            });

            const vector = tfidf.listTerms(index).map(term => term.tfidf);
            userProfile.push(vector);
        }
    });
    console.log("aaaaaaaaaa", userProfile);


    // Tính toán độ tương đồng cosine
    const similarityScores = courses.map((course, index) => {
        const terms = tfidf.listTerms(index);
        console.log("Terms and TF-IDF values for course index", index);
        terms.forEach(term => {
            console.log(`Term: ${term.term}, TF-IDF: ${term.tfidf}`);
        });

        const vector = tfidf.listTerms(index).map(term => term.tfidf);
        const userVector = userProfile.flat();
        console.log("UserVector", userVector);

        return cosineSimilarity(userVector, vector);
    });
    console.log("similarityScores", similarityScores);

    // Sắp xếp các khóa học theo độ tương đồng
    const sortedCourses = courses.map((course, index) => ({ course, score: similarityScores[index] }))
        .sort((a, b) => b.score - a.score);

    // Lọc ra những khóa học đã đăng ký rồi
    const recommendedCourses = sortedCourses
        .filter(item => !userCourseIds.includes(item.course._id.toString()))
        .slice(0, 6)
        .map(item => item.course);

    return recommendedCourses;
};
// export const abc = () => {

//     const tfidf = new TfIdf();

//     tfidf.addDocument('this is a sample document');
//     tfidf.addDocument('this document is another sample document');


//     tfidf.tfidf('sample', 0, function (i, measure) {
//         console.log("aaaaaaaaaaaaaaa", measure);

//         console.log("TF - IDF value for sample in document 0:", measure);

//         // console.log(');
//     });
// }


