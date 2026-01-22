import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"
import dotenv from 'dotenv';
import userRouter from '../routes/user.route.js'
import adminArea from '../routes/adminarea.route.js'
import targetRouter from '../routes/target.route.js'
import mahallaRouter from '../routes/mahalla.route.js'
import houseRouter from '../routes/house.route.js'
import { swaggerUi, specs } from './swagger.js'
import surveydata  from '../routes/surveydata.route.js'

dotenv.config();

const corsOptions = {
    origin: '*', // Allow all origins
    credentials: true,
    exposedHeaders: "x-auth-token",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  };


export default (app) => {
    
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));
    app.use(cors(corsOptions));
    app.use(cookieParser(process.env.cookieParserSecret || 'q1y1npar0l'));
    app.use(express.static('./static'));

    app.get('/', (_, res) => {
        res.send('Hello World!');
    });

    app.use('/api/users', userRouter);
    app.use('/api/adminarea', adminArea);
    app.use('/api/targets', targetRouter);
    app.use('/api/survey-data', surveydata);
    app.use('/api/mahalla', mahallaRouter);
    app.use('/api/house', houseRouter);

    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}