require("dotenv").config(); // ✅ Load .env variables

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Database Connected...");
}).catch((err) => {
    console.log("Failed to Connect:", err);
});

const credential = mongoose.model("credential", {}, "bulkmail");

// ✅ Root route to avoid 404 on base URL
app.get("/", (req, res) => {
    res.send("Bulk Mail Backend is running!");
});

// ✅ Favicon route to silence browser requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ✅ Email sending route
app.post("/sendemail", async (req, res) => {
    const msg = req.body.msg;
    const emailList = req.body.emailList;

    try {
        await credential.find(); // Optional: use data if needed

        const transporter = nodemailer.createTransport({
            service: "gmail",
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

        res.send(true);
    } catch (error) {
        console.log("Error sending email:", error);
        res.send(false);
    }
});

// ✅ Export the app for Vercel
module.exports = app;