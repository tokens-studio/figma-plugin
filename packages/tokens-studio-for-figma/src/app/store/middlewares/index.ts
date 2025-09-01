import { tokenStateMiddleware } from './tokenState';
import { asyncActionMiddleware } from '../asyncActionMiddleware';

export const middlewares = [tokenStateMiddleware, asyncActionMiddleware];
