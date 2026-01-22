import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import csrf from 'csurf'
import fs from 'fs/promises' // Добавлено для создания директорий
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const rateLimit = require('express-rate-limit')

const { PORT = 3000 } = process.env
const app = express()

// Добавлено: создаём директории для загрузок, если их нет
async function createUploadDirs() {
    const publicDir = path.join(__dirname, '../public')
    const tempDir = path.join(
        __dirname,
        '../public',
        process.env.UPLOAD_PATH_TEMP || ''
    )
    const permanentDir = path.join(
        __dirname,
        '../public',
        process.env.UPLOAD_PATH || ''
    )

    await fs.mkdir(publicDir, { recursive: true })
    await fs.mkdir(tempDir, { recursive: true })
    await fs.mkdir(permanentDir, { recursive: true })
}

// Rate limiting для защиты от DDoS
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 минута
    max: 15, // 15 запросов в минуту
    message: 'Слишком много запросов с этого IP, попробуйте позже.',
})

// Перемещено cors перед limiter
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    })
)

app.use(limiter)
app.use(cookieParser())

const csrfProtection = csrf({ cookie: true })

app.use(serveStatic(path.join(__dirname, 'public')))

// Эндпоинт для получения CSRF-токена
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

app.use(urlencoded({ extended: true, limit: '1mb' })) // Добавлен limit
app.use(json({ limit: '1mb' })) // Добавлен limit

// CSRF-защита для всех критических методов, КРОМЕ публичных endpoints
app.use((req, res, next) => {
    const publicEndpoints = ['/auth/login', '/auth/register', '/csrf-token']

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
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
        await createUploadDirs() // Добавлено: создаём директории перед запуском
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
