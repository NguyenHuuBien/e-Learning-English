export const ErrorCodes = {
    SUCCESS: 200,
    PARAMETER_ERROR: 400,
    SYSTEM_ERROR: 500,
    NOT_FOUND: 404,
    EXIST_DATA: 400,
    AUTHENTICATION_ERROR: 401,
    PERMISSION_ERROR: 403,
    UPLOAD_ERROR: 400
}

export const ROLES = ["admin", "owner", "manager", "teacher", "student"]

// Hình thức học 
export const FORM = {
    ONLINE: 0,
    OFFLINE: 1
}
export const TYPE_COURSE = {
    IELTS: 0,
    TOEIC: 1
}

export const DAY_OF_WEEK = {
    MONDAY: 2,
    TUESDAY: 3,
    WENDSDAY: 4,
    THURSDAY: 5,
    FRIDAY: 6,
    SATURDAY: 7,
    SUNDAY: 8
}
export const PAYMENT_STATUS = {
    NOT_PAY: 0, // chua thanh toan
    PAID: 1, // thanh toan het
    PAY_PART: 2, // thanh toan 1 phan
    CANCEL: 3
}
export const RANK_TOEIC = {
    '0_250': 0,
    '250_500': 1,
    '500_750': 2,
    '750_990': 3,
}
export const RANK_IELST = {
    '0_5.0': 0,
    '5.0_6.5': 1,
    '6.5_8.0': 2,
    '8.0_9.0': 3,
}