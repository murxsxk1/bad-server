import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'

const authRouter = Router()

// Публичные endpoints
authRouter.post('/login', login)  // CSRF-защита применяется глобально в app.ts
authRouter.post('/register', register)  // CSRF-защита применяется глобально в app.ts
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)

// Защищенные endpoints (требуют авторизации)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)  // CSRF-защита применяется глобально
authRouter.get('/user/roles', auth, getCurrentUserRoles)

export default authRouter