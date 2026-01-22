import { Joi, celebrate } from 'celebrate'
import { Types } from 'mongoose'

// Определяем все константы здесь, чтобы избежать циклических зависимостей
export const phoneRegExp = /^(\+\d{1,3})?[\s-]?(\(?\d{1,4}\)?[\s-]?){1,10}$/

export enum PaymentType {
  Card = 'card',
  Online = 'online',
}

export enum StatusType {
  Cancelled = 'cancelled',
  Completed = 'completed',
  New = 'new',
  Delivering = 'delivering',
}

// Валидация создания заказа
export const validateOrderBody = celebrate({
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.string().custom((value, helpers) => {
          if (Types.ObjectId.isValid(value)) {
            return value
          }
          return helpers.message({ custom: 'Невалидный id' })
        })
      )
      .messages({
        'array.empty': 'Не указаны товары',
      }),
    payment: Joi.string()
      .valid(...Object.values(PaymentType))
      .required()
      .messages({
        'string.valid': 'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
        'string.empty': 'Не указан способ оплаты',
      }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Не указан email',
    }),
    phone: Joi.string().required().pattern(phoneRegExp).messages({
      'string.empty': 'Не указан телефон',
    }),
    address: Joi.string().required().messages({
      'string.empty': 'Не указан адрес',
    }),
    total: Joi.number().required().messages({
      'string.empty': 'Не указана сумма заказа',
    }),
    comment: Joi.string().optional().allow('').max(1000).messages({
      'string.max': 'Максимальная длина комментария - 1000 символов'
    }),
  }),
})

// Валидация query параметров для списка заказов
export const validateOrdersQuery = celebrate({
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    status: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(StatusType)),
        Joi.array().items(Joi.string().valid(...Object.values(StatusType)))
      )
      .optional(),
    totalAmountFrom: Joi.number().optional(),
    totalAmountTo: Joi.number().optional(),
    orderDateFrom: Joi.date().optional(),
    orderDateTo: Joi.date().optional(),
    search: Joi.string().optional(),
  }).unknown(true), // ДОБАВЛЕНО: разрешаем неизвестные параметры
})

// Валидация query параметров для списка клиентов
export const validateCustomersQuery = celebrate({
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    registrationDateFrom: Joi.date().optional(),
    registrationDateTo: Joi.date().optional(),
    lastOrderDateFrom: Joi.date().optional(),
    lastOrderDateTo: Joi.date().optional(),
    totalAmountFrom: Joi.number().optional(),
    totalAmountTo: Joi.number().optional(),
    orderCountFrom: Joi.number().integer().optional(),
    orderCountTo: Joi.number().integer().optional(),
    search: Joi.string().optional(),
  }).unknown(true), // ДОБАВЛЕНО: разрешаем неизвестные параметры
})

// Валидация товара
export const validateProductBody = celebrate({
  body: Joi.object().keys({
    title: Joi.string().required().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля "name" - 2',
      'string.max': 'Максимальная длина поля "name" - 30',
      'string.empty': 'Поле "title" должно быть заполнено',
    }),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }),
    category: Joi.string().required().messages({
      'string.empty': 'Поле "category" должно быть заполнено',
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Поле "description" должно быть заполнено',
    }),
    price: Joi.number().allow(null),
  }),
})

export const validateProductUpdateBody = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля "name" - 2',
      'string.max': 'Максимальная длина поля "name" - 30',
    }),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
})

export const validateObjId = celebrate({
  params: Joi.object().keys({
    productId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (Types.ObjectId.isValid(value)) {
          return value
        }
        return helpers.message({ any: 'Невалидный id' })
      }),
  }),
})

export const validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля "name" - 2',
      'string.max': 'Максимальная длина поля "name" - 30',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Поле "password" должно быть заполнено',
    }),
    email: Joi.string()
      .required()
      .email()
      .message('Поле "email" должно быть валидным email-адресом')
      .messages({
        'string.empty': 'Поле "email" должно быть заполнено',
      }),
  }),
})

export const validateAuthentication = celebrate({
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email()
      .message('Поле "email" должно быть валидным email-адресом')
      .messages({
        'string.required': 'Поле "email" должно быть заполнено',
      }),
    password: Joi.string().required().messages({
      'string.empty': 'Поле "password" должно быть заполнено',
    }),
  }),
})