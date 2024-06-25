import {configDotenv} from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js';

configDotenv();
const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.on('error', (error) => {
        console.log('express error: ', error)
        throw error
    })
    app.listen(port, () => {
        console.log(`App is listening on port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.error("DB connection failed: ", error)
    throw error
})

/*
// one way to connect DB using IIFE or create a function a function and execute it.
import mongoose from "mongoose"
import {DB_NAME} from './constants.js'
import express from "express"
const app = express()


function connectDB(){

}
connectDB()


;(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERR: ", error)
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch(err){
        console.error("ERROR: ", err)
        throw err
    }
})()
*/