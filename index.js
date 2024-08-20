import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import dayjs from "dayjs"
import path from "path"
import express from "express"
import { fileURLToPath } from 'url';
import logger from "./src/configs/logger.js"
import errorHandler from "./src/configs/errorHandler.js"
import { routes } from "./src/routes/index.js"
import { NotFoundError } from "./src/configs/errors.js"
// export { default as adminControllers } from './src/routes/routes.js'
// import router from "./src/vnpay_nodejs_fake/routes/order.js"
import router from "./src/vnpay_nodejs/routes/order.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const app = express()
dayjs.locale("vi")
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//
app.set('views', path.join(__dirname, '/src/vnpay_nodejs/views'))
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '/src/vnpay_nodejs/public')));

mongoose.set('strictQuery', false)
process.env.NODE_ENV === "production" ? mongoose.connect(process.env.MONGODB_URL_PRODUCT) : mongoose.connect(process.env.MONGODB_URL_DEV)
    .then(() => {
        console.log("Database connect Successfully");
    })
    .catch(() => {
        console.log("Database connect Fail");
    })

app.use('/test', (req, res) => {
    return res.json("Open")
})
app.use("/", routes)
app.use("/vnpay", router)
app.use((req, res, next) => {
    throw new NotFoundError(`${req.originalUrl} không tồn tại`)
})
app.use(errorHandler)
process.on('uncaughtException', function (err) {
    logger.error(`Caught exception: ${err.status} \n ${err.message}`)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Server is running");
})