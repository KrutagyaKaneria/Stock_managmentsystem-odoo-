import express from "express";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

// Send OTP to email
router.post("/send-otp", authController.sendOTP);

// Verify OTP and get token
router.post("/verify-otp", authController.verifyOTP);

// Logout
router.post("/logout", authController.logout);

export default router;
