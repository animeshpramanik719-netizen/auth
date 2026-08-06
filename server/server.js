const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/",(req,res)=> res.send("Server is running")); 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});