import express from 'express'
import cors from 'cors'
// import bodyParser from 'body-parser'
import cookieParser from "cookie-parser"
// import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv';
import userRouter from '../routes/user.route.js'

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

    
}