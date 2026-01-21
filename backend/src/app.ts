import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import csrf from 'csurf'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const rateLimit = require('express-rate-limit')

const { PORT = 3000 } = process.env
const app = express()

// Rate limiting для защиты от DDoS
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 минута
    max: 15, // 15 запросов в минуту (минимум 10 по ТЗ)
    message: 'Слишком много запросов с этого IP, попробуйте позже.',
})

app.use(limiter)
app.use(cookieParser())

const csrfProtection = csrf({ cookie: true })

app.use(cors())
app.use(serveStatic(path.join(__dirname, 'public')))

// Эндпоинт для получения CSRF-токена (ДО парсинга body!)
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

app.use(urlencoded({ extended: true }))
app.use(json())

// CSRF-защита для всех критических методов, КРОМЕ публичных endpoints
app.use((req, res, next) => {
    // Публичные endpoints, не требующие CSRF-защиты
    const publicEndpoints = ['/auth/login', '/auth/register', '/csrf-token']

    // Только для методов, изменяющих данные
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // Проверяем полный путь (req.path включает префиксы из routes)
        const isPublicEndpoint = publicEndpoints.some(
            (endpoint) =>
                req.path === endpoint || req.path.startsWith(`${endpoint}/`)
        )

        if (isPublicEndpoint) {
            return next()
        }

        return csrfProtection(req, res, next)
    }

    next()
})

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
