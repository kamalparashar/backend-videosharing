import {configDotenv} from 'dotenv'
import connectDB from './db/index.js'

configDotenv()
connectDB()

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