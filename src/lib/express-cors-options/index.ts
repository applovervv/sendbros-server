import CorsOptionsBuilder from '../cors-options-builder';
import cors from 'cors';
import { Express } from 'express';

export const configureExpressCorsOptions = (app: Express) => {
    app.use(cors(CorsOptionsBuilder.fromEnv('EXPRESS')));
}
