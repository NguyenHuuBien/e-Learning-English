import { ErrorCodes } from "./constant.js";

export const handleRequest = handler => async (req, res, next) => {
    if (typeof handler !== "function")
        throw new Error("Handler must be a function")
    try {
        console.log('req.body', req.body);
        console.log('req.file', req.file);
        let data = await handler({
            header: req.headers,
            body: req.body,
            params: req.params,
            query: req.query,
            user: req.user,
            files: req.files,
            file: req.file,
        })
        res.json({ code: ErrorCodes.SUCCESS, data: data })
    } catch (error) {
        next(error)
    }
}