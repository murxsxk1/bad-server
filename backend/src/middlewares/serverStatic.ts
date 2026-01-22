import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Определяем абсолютный путь к запрашиваемому файлу
    const requestedPath = path.normalize(req.path)
    const filePath = path.resolve(baseDir, `.${requestedPath}`)

    // Проверка: filePath должен начинаться с baseDir
    // Защита от Path Traversal атак
    if (!filePath.startsWith(path.resolve(baseDir))) {
      return res.status(403).send('Access denied')
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Файл не существует — передаём дальше
        return next()
      }

      // Файл существует, отправляем его клиенту
      return res.sendFile(filePath, (sendFileErr) => {
        if (sendFileErr) {
          next(sendFileErr)
        }
      })
    })
  }
}