import TfIdf from 'node-tfidf';

// Dữ liệu mẫu
const courses = [
    {
        _id: "64c6e3b8d4b3d65aeb5a93c3",
        name: "Khóa học IELTS cơ bản",
        name_search: "ielts co ban",
        code: "IELTS001",
        cost: 2000000,
        discount: 10,
        rank: 2,
        status: 1,
        description: "Khóa học IELTS dành cho người mới bắt đầu.",
        total_user_vote: 20,
        average_rate: 4.5,
        img: "ielts-basic.jpg",
        purpose: ["Thi IELTS", "Học tiếng Anh"],
        teacher: "64c6e3b8d4b3d65aeb5a93b8"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c5",
        name: "Khóa học TOEIC nâng cao",
        name_search: "toeic nang cao",
        code: "TOEIC002",
        cost: 2500000,
        discount: 5,
        rank: 3,
        status: 1,
        description: "Khóa học TOEIC dành cho những người muốn nâng cao điểm số.",
        total_user_vote: 15,
        average_rate: 4.2,
        img: "toeic-advanced.jpg",
        purpose: ["Thi TOEIC", "Cải thiện điểm số"],
        teacher: "64c6e3b8d4b3d65aeb5a93b9"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c6",
        name: "Khóa học TOEFL cơ bản",
        name_search: "toefl co ban",
        code: "TOEFL003",
        cost: 1800000,
        discount: 15,
        rank: 1,
        status: 1,
        description: "Khóa học TOEFL dành cho người mới bắt đầu.",
        total_user_vote: 10,
        average_rate: 4.0,
        img: "toefl-basic.jpg",
        purpose: ["Thi TOEFL", "Học tiếng Anh"],
        teacher: "64c6e3b8d4b3d65aeb5a93ba"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c7",
        name: "Khóa học luyện nói tiếng Anh",
        name_search: "luyen noi tieng anh",
        code: "SPEAK004",
        cost: 1600000,
        discount: 0,
        rank: 2,
        status: 1,
        description: "Khóa học tập trung vào kỹ năng nói tiếng Anh.",
        total_user_vote: 8,
        average_rate: 4.3,
        img: "speaking.jpg",
        purpose: ["Nâng cao kỹ năng nói", "Học tiếng Anh"],
        teacher: "64c6e3b8d4b3d65aeb5a93bb"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c8",
        name: "Khóa học giao tiếp quốc tế",
        name_search: "giao tiep quoc te",
        code: "INTL005",
        cost: 2200000,
        discount: 8,
        rank: 3,
        status: 1,
        description: "Khóa học giúp cải thiện kỹ năng giao tiếp quốc tế.",
        total_user_vote: 5,
        average_rate: 4.1,
        img: "international.jpg",
        purpose: ["Giao tiếp quốc tế", "Phát triển kỹ năng mềm"],
        teacher: "64c6e3b8d4b3d65aeb5a93bc"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c9",
        name: "Khóa học tiếng Anh doanh nghiệp",
        name_search: "tieng anh doanh nghiep",
        code: "BUSINESS006",
        cost: 2700000,
        discount: 12,
        rank: 2,
        status: 1,
        description: "Khóa học tiếng Anh dành cho doanh nhân và người làm việc trong môi trường quốc tế.",
        total_user_vote: 6,
        average_rate: 4.6,
        img: "business.jpg",
        purpose: ["Tiếng Anh doanh nghiệp", "Phát triển sự nghiệp"],
        teacher: "64c6e3b8d4b3d65aeb5a93bd"
    }
]
const courseRegisters = [
    {
        _id: "64c6e3b8d4b3d65aeb5a93c2",
        user: "64c6e3b8d4b3d65aeb5a93b1",
        course: "64c6e3b8d4b3d65aeb5a93c3",
        payment_status: 1,
        paid: 1000000,
        debt: 0,
        bill_id: "INV1234567890",
        date_time: "2024-07-30T10:00:00Z",
        bank: "Vietcombank"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c4",
        user: "64c6e3b8d4b3d65aeb5a93b1",
        course: "64c6e3b8d4b3d65aeb5a93c5",
        payment_status: 1,
        paid: 1500000,
        debt: 0,
        bill_id: "INV1234567891",
        date_time: "2024-07-31T11:00:00Z",
        bank: "Techcombank"
    },
    {
        _id: "64c6e3b8d4b3d65aeb5a93c6",
        user: "64c6e3b8d4b3d65aeb5a93b1",
        course: "64c6e3b8d4b3d65aeb5a93c7",
        payment_status: 1,
        paid: 1200000,
        debt: 0,
        bill_id: "INV1234567892",
        date_time: "2024-08-01T12:00:00Z",
        bank: "VietinBank"
    }
]

// Hàm để tạo đặc trưng kết hợp
function combineFeatures(course) {
    const teacher = course.teacher ? course.teacher.toString() : '';
    return `${course.rank}, ${course.purpose.join(', ')}, ${teacher}, ${course.average_rate}`;
}

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + (val || 0) * (val || 0), 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Endpoint để gợi ý khóa học
export const abc = async () => {

    // Lấy lịch sử đăng ký khóa học của người dùng từ dữ liệu mẫu
    const userCourseRegisters = courseRegisters;

    // Lấy tất cả các khóa học có status bằng 1 từ dữ liệu mẫu
    const availableCourses = courses.filter(course => course.status === 1);

    // Tạo TF-IDF vectorizer
    const tfidf = new TfIdf();
    const courseFeatures = availableCourses.map(course => combineFeatures(course));
    const registeredCourses = userCourseRegisters.map(register => {
        const course = availableCourses.find(course => course._id === register.course);
        return course ? combineFeatures(course) : '';
    });
    console.log("courseFeatures", courseFeatures);
    console.log("registeredCourses", registeredCourses);

    // Thêm tài liệu vào TF-IDF
    courseFeatures.concat(registeredCourses).forEach(features => {
        // Chuyển đổi văn bản thành chữ thường trước khi thêm
        // const lowerCaseFeatures = features.toLowerCase();
        tfidf.addDocument(features);
    });

    // Hồ sơ người dùng dựa trên lịch sử đăng ký khóa học
    const userCourseIds = userCourseRegisters.map(register => register.course.toString());

    // Tạo vector cho hồ sơ người dùng
    const userProfile = new Array(tfidf.listTerms(0).length).fill(0); // Khởi tạo với kích thước đúng

    availableCourses.forEach((course, index) => {
        if (userCourseIds.includes(course._id.toString())) {
            const vector = tfidf.listTerms(index).map(term => term.tfidf);
            vector.forEach((value, i) => {
                userProfile[i] = (userProfile[i] || 0) + value;
            });
        }
    });


    // Tính toán độ tương đồng cosine cho từng khóa học
    const similarityScores = availableCourses.map((course, index) => {
        const terms = tfidf.listTerms(index);
        console.log("Terms and TF-IDF values for course index", index);
        terms.forEach(term => {
            console.log(`Term: ${term.term}, TF-IDF: ${term.tfidf}`);
        });
        const vector = tfidf.listTerms(index).map(term => term.tfidf);
        const similarity = cosineSimilarity(userProfile, vector);

        console.log(`Similarity for course ${course.name}:`, similarity); // Debugging line

        return similarity;
    });

    console.log("similarityScores", similarityScores);

    // Sắp xếp các khóa học theo độ tương đồng
    const sortedCourses = availableCourses.map((course, index) => ({ course, score: similarityScores[index] }))
        .sort((a, b) => b.score - a.score);

    // Lọc ra những khóa học đã đăng ký rồi
    const recommendedCourses = sortedCourses
        .filter(item => !userCourseRegisters.some(register => register.course === item.course._id))
        .slice(0, 6)
        .map(item => item.course);

    return recommendedCourses;
};


// import TfIdf from 'node-tfidf';
// export const abc = () => {
//     const tfidf = new TfIdf();

//     // Ví dụ về các khóa học
//     const courseDescriptions = [
//         'Bạn sẽ đạt được gì sau khoá học? Làm chủ tốc độ và các ngữ điệu khác nhau trong phần thi IELTS Listening...',
//         'Nẵm vững các chủ điểm ngữ pháp cơ bản. Xây dựng vốn từ vựng thông dụng cho 99% ngữ cảnh...',
//         // Thêm các mô tả khác
//     ];

//     // Thêm tài liệu vào TF-IDF
//     courseDescriptions.forEach(description => {
//         tfidf.addDocument(description);
//     });

//     // Lấy các term và giá trị TF-IDF
//     courseDescriptions.forEach((description, index) => {
//         console.log(`Terms and TF-IDF values for course index ${index}`);
//         tfidf.listTerms(index).forEach(term => {
//             console.log(`Term: ${term.term}, TF-IDF: ${term.tfidf}`);
//         });
//     });
// }
