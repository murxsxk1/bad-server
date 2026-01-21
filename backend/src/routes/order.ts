import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'  // ИСПРАВЛЕНО: orders.ts (с "s")
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'
import { Role } from '../models/user'

const orderRouter = Router()

// ВАЖНО: Специфичные пути должны идти ДО параметризованных!

// АДМИНИСТРАТИВНЫЕ ENDPOINTS (специфичные пути идут первыми)
orderRouter.get('/all', auth, roleGuardMiddleware(Role.Admin), getOrders)

// ПОЛЬЗОВАТЕЛЬСКИЕ ENDPOINTS (специфичные пути)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)

// СОЗДАНИЕ ЗАКАЗА (публичный для авторизованных)
orderRouter.post('/', auth, validateOrderBody, createOrder)

// ПАРАМЕТРИЗОВАННЫЕ ПУТИ (идут в конце!)
// Admin: получение заказа по номеру
orderRouter.get(
    '/:orderNumber',
    auth,
    roleGuardMiddleware(Role.Admin),
    getOrderByNumber
)

// Admin: обновление заказа
orderRouter.patch(
    '/:orderNumber',
    auth,
    roleGuardMiddleware(Role.Admin),
    updateOrder
)

// Admin: удаление заказа
orderRouter.delete(
    '/:id',
    auth,
    roleGuardMiddleware(Role.Admin),
    deleteOrder
)

export default orderRouter