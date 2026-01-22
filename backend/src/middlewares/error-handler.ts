import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    // Обработка ошибок CSRF
    if (err.code === 'EBADCSRFTOKEN') {
        return res
            .status(400)
            .send({ message: 'CSRF token invalid or missing' }) // Изменено с 403 на 400
    }
    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message
    console.log(err)

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler
