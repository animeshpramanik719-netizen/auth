import express from "express";
import { login, register, logout } from "../controllers/authControllers.js";

const authRouter = express.Router();

authRouter.get("/test", (req, res) => {
    console.log("TEST HIT");
    res.send("Auth Router Working");
});

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

console.log("Auth routes loaded");

export default authRouter;