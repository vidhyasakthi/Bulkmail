const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();  // ✅ load env variables

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected..."))
  .catch(err => console.log("Failed to Connect:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;
    const data = await credential.find();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || data[0].toJSON().user,
        pass: process.env.EMAIL_PASS || data[0].toJSON().pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailList[i],
        subject: "A Message from Bulk Mail App",
        text: msg,
      });
      console.log("Email sent to:" + emailList[i]);
    }

    res.send(true);
  } catch (error) {
    console.error(error);
    res.send(false);
  }
});

app.listen(5000, () => {
  console.log("Server Started on port 5000");
});
