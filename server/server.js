import "./config/loadEnv.js";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
// import dotenv from "dotenv";

// dotenv.config({ path: "./server/.env" });
// console.log(process.env);
// console.log("MONGODB_URI:", process.env.MONGODB_URI);
// console.log("Loaded URI:", process.env.MONGODB_URI);
const app = express();
const PORT = process.env.PORT || 7000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors());


// API Endpoints
app.get("/", (req, res) => {res.send("Server is running...");
});


app.use("/api/auth", authRouter);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});