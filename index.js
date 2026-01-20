import express from 'express'
import './startup/db.js'
import routers from './startup/router.js'
import dotenv from 'dotenv';

dotenv.config();

const app = express()
routers(app);

let server = app.listen(process.env.PORT || 3000, err => {
    if(err)
        console.error(err);
    else
        console.log(`3000 portni tinglash boshlandi!!!`);
})

export default server;