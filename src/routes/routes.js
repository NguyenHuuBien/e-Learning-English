import express from "express"
import * as Verify from "../middlewares/verify.js"
import * as CenterController from "../controllers/CenterController.js"
import * as BranchController from "../controllers/BranchController.js"
import * as UserController from "../controllers/UserController.js"
import * as CourseController from "../controllers/CourseController.js"
import * as LessonController from "../controllers/LessonController.js"
import * as DocumentController from "../controllers/DocumentController.js"
import * as TestController from "../controllers/TestController.js"
import * as QuestionController from "../controllers/QuestionController.js"
import * as ResultController from "../controllers/ResultController.js"
import * as SCORMController from "../controllers/SCORMController.js"
import * as ContentBaseController from "../controllers/ContentBaseController.js"
import * as BlogController from "../controllers/BlogController.js"
import * as ReportCourseController from "../controllers/ReportCourseController.js"
import * as ReportTestController from "../controllers/ReportTestController.js"
import * as EvaluateController from "../controllers/EvaluateController.js"
import * as abc from "../controllers/abc.js"
import * as Upload from "../middlewares/upload.js"
import { handleRequest } from "../configs/dataHandler.js"
// import { pay } from "../utils/vnpay.js"

const route = express.Router()

route.get("/", (req, res) => {
    return res.json("Open1")
})

//Login
route.post("/login", handleRequest(Verify.login))
route.delete("/logout", handleRequest(Verify.deleteRefreshToken))
route.post("/refresh/token", handleRequest(Verify.verifyRefreshToken))
route.post("/forgot/password", handleRequest(Verify.forgotPassword))
route.post("/register/account", handleRequest(Verify.registerAccount))

//Trung tâm
// route.post("/center/create", Verify.verifyToken(["admin, owner"]), handleRequest(CenterController.create))
// route.get("/center/list", Verify.verifyToken(["admin, owner"]), handleRequest(CenterController.list))

//Branch
// route.post("/branch/create", Verify.verifyToken(["admin, owner", "manager"]), handleRequest(BranchController.create))
// route.put("/branch/update/:id", Verify.verifyToken(["admin, owner", "manager"]), handleRequest(BranchController.update))
// route.get("/branch/get/:id", Verify.verifyToken(["admin, owner", "manager"]), handleRequest(BranchController.get))
// route.get("/branch/list", Verify.verifyToken(["admin, owner", "manager"]), handleRequest(BranchController.list))

//User
route.post("/user/create", Upload.uploadImage.single("img"), handleRequest(UserController.create))
route.put("/user/update/:id", Upload.uploadImage.single("img"), handleRequest(UserController.update))
route.get("/user/get/:id", handleRequest(UserController.get))
route.get("/user/list", Verify.verifyToken(["admin", "owner", "manager"]), handleRequest(UserController.list))

//Course
route.post("/course/create", Verify.verifyToken(["teacher"]), Upload.uploadImage.single("img"), handleRequest(CourseController.create))
route.put("/course/update/:id", Verify.verifyToken(["teacher"]), Upload.uploadImage.single("img"), handleRequest(CourseController.update))
route.get("/course/get/:id", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(CourseController.get))
route.get("/course/list", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(CourseController.list))

//Lesson
route.post("/lesson/create", Verify.verifyToken(["teacher"]), Upload.uploadSCORM.array("file", 5), handleRequest(LessonController.create))
route.put("/lesson/update/:id", Verify.verifyToken(["teacher"]), Upload.uploadSCORM.single("file"), handleRequest(LessonController.update))
route.get("/lesson/get/:id", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(LessonController.get))
route.get("/lesson/list", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(LessonController.list))


//Document
route.post("/document/create", Verify.verifyToken(["teacher"]), Upload.uploadDocument.array("document", 5), handleRequest(DocumentController.create))
route.put("/document/update/:id", Verify.verifyToken(["teacher"]), Upload.uploadDocument.single("document"), handleRequest(DocumentController.update))
route.get("/document/get/:id", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(DocumentController.get))
route.get("/document/list", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(DocumentController.list))

//Test
route.post("/course/test/create", Verify.verifyToken(["teacher"]), handleRequest(TestController.create))
route.put("/course/test/update/:id", Verify.verifyToken(["teacher"]), handleRequest(TestController.update))
route.get("/course/test/get/:id", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(TestController.get))
route.get("/course/test/list", Verify.verifyToken(["admin", "owner", "manager", "teacher", "student"]), handleRequest(TestController.list))

//Questions
route.post("/question/create", Verify.verifyToken(), Upload.uploadQuestions.array("files", 5), handleRequest(QuestionController.create))
// route.post("/question/upload", Verify.verifyToken(), Upload.uploadQuestions.array("file", 5), handleRequest(QuestionController.questionUpload))
route.put("/question/update/:id", Verify.verifyToken(), Upload.uploadQuestions.array("files", 5), handleRequest(QuestionController.update))
route.get("/question/get/:id", Verify.verifyToken(), handleRequest(QuestionController.get))
route.get("/question/list", Verify.verifyToken(), handleRequest(QuestionController.list))

//Result
route.post("/result/create", Verify.verifyToken(), handleRequest(ResultController.create))
// route.put("/result/update/:id", Verify.verifyToken(), handleRequest(ResultController.update))
route.get("/result/get/:id", Verify.verifyToken(), handleRequest(ResultController.get))
route.get("/result/list", Verify.verifyToken(), handleRequest(ResultController.list))

//Evaluate
route.post("/evaluate/create", Verify.verifyToken(["admin", "student"]), handleRequest(EvaluateController.create))
route.put("/evaluate/update/:id", Verify.verifyToken(["admin", "student"]), handleRequest(EvaluateController.update))
route.get("/evaluate/get/:id", Verify.verifyToken(), handleRequest(EvaluateController.get))
route.get("/evaluate/list", Verify.verifyToken(), handleRequest(EvaluateController.list))

//SCORM
route.post("/scorm/launch", Verify.verifyToken(), handleRequest(SCORMController.scormLanch))

//Content Base
route.get("/suggest/course", Verify.verifyToken(), handleRequest(ContentBaseController.abc))
route.get("/suggest/course/test", handleRequest(abc.abc))

//Blog
route.post("/blog/create", Verify.verifyToken(), handleRequest(BlogController.create))
route.post("/blog/upload", Verify.verifyToken(), Upload.uploadImage.single("file"), handleRequest(BlogController.uploadPicture))
route.put("/blog/update/:id", Verify.verifyToken(), handleRequest(BlogController.update))
route.get("/blog/get/:id", Verify.verifyToken(), handleRequest(BlogController.get))
route.get("/blog/list", Verify.verifyToken(), handleRequest(BlogController.list))

//Report
route.get("/report/course", Verify.verifyToken(["teacher", "admin",]), handleRequest(ReportCourseController.list))
route.get("/report/test", Verify.verifyToken(["student"]), handleRequest(ReportTestController.list))

export default route