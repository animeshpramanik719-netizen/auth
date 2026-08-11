import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { text } from "express";

export const register = async (req, res) =>{
     console.log("Register API Hit");

     const{ name, email, password } = req.body;

     if(!name || !email || !password){

        return res.json({success: false, message: "Please fill all the fields" });
     }

     try{

        const existing = await userModel.findOne({ email });

        if(existing){

           return res.json({success: false, message: "User already exists"});

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({name, email, password: hashedPassword});

        await newUser.save();


        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        res.cookie("token", token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });


         //sending  wellcome email to the user after registration
         const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Welcome to Our App",
    html: `
        <h2>Welcome to Our App!</h2>
        <p>Your account has been successfully created.</p>
        <p>Your email: <strong>${email}</strong></p>
        <p>We are excited to have you on board!</p>
        <p>Thank you.</p>
    `,
};

await transporter.sendMail(mailOptions);

         return res.json({success: true,})


     }catch(error){
        console.error(error);
        res.json({success: false, message: error.message })


     }
}


export const login = async (req, res)=>{

    const {email, password} = req.body;
    if(!email || !password){
        return res.json({success: false, message: "email or password are required" });
    }
    try{

        const user = await userModel.findOne({email});
         if(!user){
            return res.json({success: false, message: "Invalid email "});
         }

         const isMatch = await bcrypt.compare(password, user.password);


         if(!isMatch){
            return res.json({success: false, message: "Invalid password "});
         }


         const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

         res.cookie("token", token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
         });  


         return res.json({success: true,})

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) =>{


    try{
            res.clearCookie("token",{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            })

            return res.json({success: true, message: "Logged out successfully"});


    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

// send verification otp to user email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account is already verified"
            });
        }

        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        user.verifyOtp = otp;
        user.verifyOtpExpiryAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account verification OTP",
            text: `Your OTP for account verification is ${otp}. Verification is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "OTP sent successfully to your email"
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};




export const verifyEmail = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user?.userId;

        // Check userId
        if (!userId) {
            return res.json({
                success: false,
                message: "User not authenticated"
            });
        }

        // Check OTP
        if (!otp) {
            return res.json({
                success: false,
                message: "OTP is required"
            });
        }

        // Find user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Check if already verified
        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Check OTP exists
        if (!user.verifyOtp) {
            return res.json({
                success: false,
                message: "No OTP found. Please request a new OTP"
            });
        }

        // Convert both OTPs to strings
        const enteredOtp = String(otp).trim();
        const savedOtp = String(user.verifyOtp).trim();

        // Check OTP
        if (enteredOtp !== savedOtp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check OTP expiry
        if (
            !user.verifyOtpExpiryAt ||
            new Date(user.verifyOtpExpiryAt).getTime() < Date.now()
        ) {
            return res.json({
                success: false,
                message: "OTP Expired"
            });
        }

        // Verify account
        user.isAccountVerified = true;

        // Clear OTP after successful verification
        user.verifyOtp = "";
        user.verifyOtpExpiryAt = null;

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Verify Email Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

