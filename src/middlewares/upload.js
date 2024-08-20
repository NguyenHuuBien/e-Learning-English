import multer from 'multer'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
dotenv.config()
// import * from "../uploads"

const imgconfig = multer.diskStorage({
    // destination: (req, file, callback) => {
    //     callback(null, 'src/uploads');
    // },
    // filename: (req, file, callback) => {
    //     callback(null, `image-${Date.now()}.${file.originalname}`);
    // },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image")) {
            return callback(new Error("Chỉ cho phép hình ảnh!"), false);
        }
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('File không hợp lệ!'), false);
        }
        if (file.size > 1024 * 1024 * 2) {
            return callback(new Error('Kích thước file không được vượt quá 2MB!'), false);
        }
        callback(null, true);
    }
});
const videoconfig = multer.diskStorage({
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("video")) {
            return callback(new Error("Chỉ cho phép Video!"), false);
        }
        if (!file.originalname.match(/\.(mp4|mov|avi)$/)) {
            return callback(new Error('File không hợp lệ!'), false);
        }
        if (file.size > 1024 * 1024 * 10) {
            return callback(new Error('Kích thước file không được vượt quá 10MB!'), false);
        }
        callback(null, true);
    }
});

const docmentConfig = multer.diskStorage({
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("application/pdf") &&
            !file.mimetype.startsWith("application/msword") &&
            !file.mimetype.startsWith("image/")) {
            return callback(new Error("Chỉ cho phép PDF!"), false);
        }
        if (!file.originalname.match(/\.(pdf|doc|jpg|jpeg|png|gif)$/)) {
            return callback(new Error('File không hợp lệ!'), false);
        }
        if (file.size > 1024 * 1024 * 10) {
            return callback(new Error('Kích thước file không được vượt quá 10MB!'), false);
        }
        callback(null, true);
    }
});
const questionConfig = multer.diskStorage({
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("audio") &&
            !file.mimetype.startsWith("image")) {
            return callback(new Error("Chỉ cho phép audio hoặc ảnh!"), false);
        }
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|mp3)$/)) {
            return callback(new Error('File không hợp lệ!'), false);
        }
        if (file.size > 1024 * 1024 * 10) {
            return callback(new Error('Kích thước file không được vượt quá 10MB!'), false);
        }
        callback(null, true);
    }
});

const CsvConfig = multer.diskStorage({
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("text/csv")) {
            return callback(new Error("Chỉ cho phép file CSV!"), false);
        }
        if (!file.originalname.match(/\.(csv)$/)) {
            return callback(new Error('File không hợp lệ!'), false);
        }
        if (file.size > 1024 * 1024 * 10) {
            return callback(new Error('Kích thước file không được vượt quá 10MB!'), false);
        }
        callback(null, true);
    }
});

const scormConfig = multer.diskStorage({
    fileFilter: (req, file, callback) => {
        const filetypes = /zip/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return callback(null, true);
        } else {
            callback(new Error('Chỉ cho phép file ZIP!'));
        }
    },
    limits: { fileSize: 1024 * 1024 * 10 } // Giới hạn kích thước file là 10MB
});

export const uploadImage = multer({
    storage: imgconfig,
})
export const uploadVideo = multer({
    storage: videoconfig,
})
export const uploadDocument = multer({
    storage: docmentConfig,
})
export const uploadQuestions = multer({
    storage: questionConfig,
})
export const uploadCSV = multer({
    storage: CsvConfig,
})
export const uploadSCORM = multer({
    storage: scormConfig,
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export const uploadFile = async (file, fileName) => {
    try {
        let newFileName = fileName ? file.originalname.replace(/\s/g, '_') + "/" + fileName : file.originalname.replace(/\s/g, '_');

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "auto", public_id: newFileName }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });

            if (file instanceof Buffer) {
                uploadStream.end(file); // Nếu file là buffer, tải trực tiếp
            } else {
                fs.createReadStream(file.path).pipe(uploadStream); // Nếu không, đọc file từ đường dẫn rồi tải lên
            }
        });
        return uploadResult.url;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Lỗi khi tải file lên!');
    }
};