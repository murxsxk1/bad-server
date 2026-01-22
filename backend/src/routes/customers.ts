import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'
import { validateCustomersQuery } from '../middlewares/validations'

const customerRouter = Router()

// Все endpoints требуют авторизацию И роль администратора
customerRouter.get('/', auth, roleGuardMiddleware(Role.Admin), validateCustomersQuery, getCustomers)
customerRouter.get('/:id', auth, roleGuardMiddleware(Role.Admin), getCustomerById)
customerRouter.patch('/:id', auth, roleGuardMiddleware(Role.Admin), updateCustomer)
customerRouter.delete('/:id', auth, roleGuardMiddleware(Role.Admin), deleteCustomer)

export default customerRouter