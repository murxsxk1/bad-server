import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'

const uploadRouter = Router()

// Загрузка файлов - только для администраторов
uploadRouter.post(
    '/',
    auth,
    roleGuardMiddleware(Role.Admin),
    fileMiddleware.single('file'),
    uploadFile
)

export default uploadRouter