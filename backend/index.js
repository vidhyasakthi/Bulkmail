require("dotenv").config(); // ✅ Load .env variables

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use environment variable for MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(function () {
    console.log("Database Connected...");
}).catch(function (err) {
    console.log("Failed to Connect:", err);
});

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", function (req, res) {
    const msg = req.body.msg;
    const emailList = req.body.emailList;

    credential.find().then(function (data) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        new Promise(async function (resolve, reject) {
            try {
                for (let i = 0; i < emailList.length; i++) {
                    await transporter.sendMail({
                        from: process.env.MAIL_FROM,
                        to: emailList[i],
                        subject: "A Message from Bulk Mail App",
                        text: msg,
                    });
                    console.log("Email sent to: " + emailList[i]);
                }
                resolve("Success");
            } catch (error) {
                console.log("Error sending email:", error);
                reject("Failed");
            }
        }).then(function () {
            res.send(true);
        }).catch(function () {
            res.send(false);
        });
    }).catch(function (error) {
        console.log("Error fetching credentials:", error);
    });
});

app.listen(5000, function () {
    console.log("Server Started on port 5000...");
});