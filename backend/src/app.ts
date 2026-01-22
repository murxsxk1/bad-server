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
  max: 15, // 15 запросов в минуту
  message: 'Слишком много запросов с этого IP, попробуйте позже.'
})

app.use(limiter)
app.use(cookieParser())

const csrfProtection = csrf({ cookie: true })

// CORS настройка
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
]

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, от Postman)
    if (!origin) return callback(null, true)
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}))

app.use(serveStatic(path.join(__dirname, 'public')))

// Эндпоинт для получения CSRF-токена
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

app.use(urlencoded({ extended: true }))
app.use(json())

// CSRF-защита для всех критических методов, КРОМЕ публичных endpoints
app.use((req, res, next) => {
  const publicEndpoints = ['/auth/login', '/auth/register', '/csrf-token']
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // ИСПРАВЛЕНО: использован template literal вместо конкатенации строк
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
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