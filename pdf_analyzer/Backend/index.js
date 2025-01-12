import express from 'express';
import pdfAnalyzerRouter from './routes/pdfAnalyzer.js';
import cors from "cors"
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import {clerkMiddleware} from "@clerk/express"
import dotenv from "dotenv"
dotenv.config()
const app = express();
const corsOptions = {
    origin: "*", 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    credentials: true, 
  };
app.use(express.json())
app.use(cors(corsOptions))
connectDB()

app.use(clerkMiddleware())
app.use('/api/pdf', pdfAnalyzerRouter);
app.use('/api/users', userRouter);

app.get("/", (req, res) => {
    res.send("Healthy Server")
})


app.listen(3002, ()=>{
    console.log("Listening 3002");
})

