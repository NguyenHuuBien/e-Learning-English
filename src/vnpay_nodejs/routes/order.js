import express from 'express';
import $ from 'jquery';
import request from 'request';
import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import * as Verify from "../../middlewares/verify.js"
import { handleRequest } from "../../configs/dataHandler.js"
import Course from '../../models/Course.js';
import { NotFoundError } from '../../configs/errors.js';
import CourseRegister from '../../models/CourseRegister.js';
import mongoose from 'mongoose';
import { createRegistration } from '../../controllers/SCORMController.js';
import User from '../../models/User.js';
import Lesson from '../../models/Lesson.js';



const router = express.Router();
const config = {
    vnp_TmnCode: "VTW3PBXP",
    vnp_HashSecret: "BDW8THCQ0OV38VYR6PVIJSWD7NJ6O3NJ",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_ReturnUrl: "https://e-learning-ohlk.onrender.com/vnpay/vnpay_return",
}
if (process.env.NODE_ENV == 'development') config.vnp_ReturnUrl = "http://localhost:8386/vnpay/vnpay_return"
const vnp_ReturnUrl = process.env.NODE_ENV == 'development' ? "http://localhost:8386/vnpay/create_payment_url" : "https://e-learning-ohlk.onrender.com/vnpay/create_payment_url"
const dataConfig = {}

router.get('/', function (req, res, next) {
    res.render('orderlist', { title: 'Danh sách đơn hàng' });
});
//, Verify.verifyToken()
router.get('/create_payment_url', async function (req, res, next) {
    const oldCourse = await Course.findById(req.query.course_id)
    if (!oldCourse) throw new NotFoundError("Không tồn tại khóa học")
    dataConfig.user = new mongoose.Types.ObjectId(req.query.user_id)
    dataConfig.course = new mongoose.Types.ObjectId(req.query.course_id)
    console.log(oldCourse.cost);
    // if (oldCourse.cost < 10000) {
    //     await CourseRegister.findOneAndUpdate({
    //         user: dataConfig.user,
    //         course: dataConfig.course
    //     }, dataConfig, { upsert: true, new: true })
    //     res.json({ success: true })
    // }
    res.render('order', { title: 'Tạo mới đơn hàng', amount: oldCourse.cost, vnp_ReturnUrl: vnp_ReturnUrl });
}); 

router.get('/querydr', function (req, res, next) {
    res.render('querydr', { title: 'Truy vấn kết quả thanh toán' });
});

router.get('/refund', function (req, res, next) {
    res.render('refund', { title: 'Hoàn tiền giao dịch thanh toán' });
});
//tạo biết lưu các trường uid, course_id, course_money, amount(trong /create_payment_url)
router.post('/create_payment_url', function (req, res, next) {
    //truyền uid, course_id, course_money
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    let tmnCode = config.vnp_TmnCode
    let secretKey = config.vnp_HashSecret
    let vnpUrl = config.vnp_Url
    let returnUrl = config.vnp_ReturnUrl
    let orderId = moment(date).format('DDHHmmss');
    let amount = req.body.amount * 100;
    let bankCode = req.body.bankCode;

    let locale = req.body.language;
    if (locale === null || locale === '') {
        locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl);
});

router.get('/vnpay_return', async function (req, res, next) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = config.vnp_TmnCode
    let secretKey = config.vnp_HashSecret

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        vnp_Params.vnp_Amount = parseInt(vnp_Params.vnp_Amount) / 100
        const oldUser = await User.findById(dataConfig.user)
        const listCourseRegister = await Lesson.find({
            course: new mongoose.Types.ObjectId(dataConfig.course),
            status: 1
        })
        await Promise.all(listCourseRegister.map(async course => {
            await createRegistration(course.code, dataConfig.user, oldUser.name, oldUser.username)

        }))

        res.render('success', { code: vnp_Params['vnp_ResponseCode'], vnp_Params });
        dataConfig.vnp_BankCode = vnp_Params['vnp_BankCode']
        dataConfig.date_time = vnp_Params['vnp_PayDate']
        dataConfig.bill_id = vnp_Params['vnp_TxnRef']
        dataConfig.paid = parseInt(vnp_Params['vnp_Amount'])
        const oldCoursRegister = await CourseRegister.findOne({ user: dataConfig.user, course: dataConfig.course })
        if (oldCoursRegister) dataConfig.paid += oldCoursRegister.paid
        const oldCourse = await Course.findById(dataConfig.course)

        if (dataConfig.paid >= oldCourse.cost - oldCourse.discount) {
            dataConfig.payment_status = 1
        } else {
            dataConfig.payment_status = 2
            dataConfig.debt = oldCourse.cost - oldCourse.discount - dataConfig.paid
        }

        await CourseRegister.findOneAndUpdate({
            user: dataConfig.user,
            course: dataConfig.course
        }, dataConfig, { upsert: true, new: true })

    } else {
        res.render('success', { code: '97' });
    }
});

router.get('/vnpay_ipn', function (req, res, next) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = config.vnp_HashSecret
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let paymentStatus = '0';
    let checkOrderId = true;
    let checkAmount = true;
    if (secureHash === signed) {
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus == "0") {
                    if (rspCode == "00") {
                        // Giao dịch thành công, cập nhật trạng thái thanh toán trong cơ sở dữ liệu
                        res.status(200).json({ RspCode: '00', Message: 'Success' });
                    } else {
                        // Giao dịch không thành công, cập nhật trạng thái thanh toán trong cơ sở dữ liệu
                        res.status(200).json({ RspCode: '00', Message: 'Success' });
                    }
                } else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                }
            } else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }
        } else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
});

router.post('/querydr', function (req, res, next) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let vnp_TmnCode = config.vnp_TmnCode
    let secretKey = config.vnp_HashSecret
    let vnp_Api = config.vnp_Api

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;

    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'querydr';
    let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

    let vnp_IpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    let currCode = 'VND';
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");

    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    request({
        url: vnp_Api,
        method: "POST",
        json: true,
        body: dataObj
    }, function (error, response, body) {
        body.vnp_Amount = body.vnp_Amount / 100
        res.render('transation', body)
    });
});

router.post('/refund', function (req, res, next) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let vnp_TmnCode = config.vnp_TmnCode
    let secretKey = config.vnp_HashSecret
    let vnp_Api = config.vnp_Api

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    let vnp_Amount = req.body.amount;
    let vnp_TransactionType = req.body.transType;
    let vnp_CreateBy = req.body.user;

    let currCode = 'VND';
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    let vnp_IpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_OrderInfo + "|" + vnp_TransactionDate + "|" + vnp_Amount + "|" + vnp_TransactionType + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr;

    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");

    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    request({
        url: vnp_Api,
        method: "POST",
        json: true,
        body: dataObj
    }, function (error, response, body) {
        console.log(response);
    });
});

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export default router;
