import express, { Express } from 'express';
import { downloadAndDeleteMiddleware } from './middlewares/download.and.delete.file';
import { GlobalStorageConfig } from './global.config';
import path from 'path';

export const configureSendbrosStorage = (app: Express, expressRoutePath: string, staticStorageFolderPath: string[]) => {
    GlobalStorageConfig.setStaticStorageFolderPath(staticStorageFolderPath);
    app.use(expressRoutePath, (req, res, next) => downloadAndDeleteMiddleware(req, res, next, staticStorageFolderPath), express.static(path.join(...staticStorageFolderPath)));
}