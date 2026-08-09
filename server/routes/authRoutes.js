import express from "express";
import { login, register, logout, sendVerifyOtp, verifyEmail } from "../controllers/authControllers.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.get("/test", (req, res) => {
    console.log("TEST HIT");
    res.send("Auth Router Working");
});

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);

console.log("Auth routes loaded");

export default authRouter;