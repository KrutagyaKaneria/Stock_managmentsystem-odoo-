import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../config/db.js";

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiry (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@stockmaster.com",
      to: email,
      subject: "StockMaster - Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #4f46e5; margin: 0;">StockMaster</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Inventory Management System</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your One-Time Password (OTP) for logging into StockMaster is:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request this code, please ignore this email. Do not share this code with anyone.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 StockMaster. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    // Send email (non-blocking)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
        // Don't return error to user, OTP is still stored
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Return success
    res.json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Verify OTP and get JWT token
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Check if OTP exists
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTPData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check if OTP is correct
    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts++;

      // Lock after 5 attempts
      if (storedOTPData.attempts >= 5) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "Too many incorrect attempts. Please request a new OTP.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is correct - create or find user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0], // Use email prefix as name
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    // Clear OTP
    otpStore.delete(email);

    // Return success with user and token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled on the client side
    // This endpoint can be used for additional cleanup if needed
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};
