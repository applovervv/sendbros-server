import morgan from 'morgan';
import { Express } from 'express';

export const configureMorganHttpLogger = (app: Express) => {
    if(process.env.NODE_ENV === 'development'){
        app.use(morgan('dev'));
    }else{
        app.use(morgan('combined'));
    }
}