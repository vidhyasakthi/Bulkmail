require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected..."))
  .catch((err) => console.log("Failed to Connect:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

// Root route
app.get("/", (req, res) => {
  res.send("Bulk Mail Backend is running!");
});

// Test env route
app.get("/testenv", (req, res) => {
  res.json({
    MAIL_USER: process.env.MAIL_USER || null,
    MAIL_FROM: process.env.MAIL_FROM || null,
  });
});

// Email sending route
app.post("/sendemail", async (req, res) => {
  const msg = req.body.msg;
  const emailList = req.body.emailList;

  if (!msg || !emailList || !Array.isArray(emailList)) {
    return res.status(400).json({ success: false, error: "Invalid request body" });
  }

  try {
    await credential.find(); // optional

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: emailList[i],
        subject: "A Message from Bulk Mail App",
        text: msg,
      });
      console.log("Email sent to:", emailList[i]);
    }

    res.json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.log("Error sending email:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export app for Vercel
module.exports = app;
