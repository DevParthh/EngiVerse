import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Force load env variables immediately in this file
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // These two settings prevent Google from dropping idle connections
  // and force it to re-authenticate cleanly every time
  pool: true, 
  maxConnections: 1,
  maxMessages: 10,
});

// Optional but highly recommended: Verify the connection when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.log("Nodemailer Auth Error: ", error.message);
  } else {
    console.log("Nodemailer is ready to send messages");
  }
});

export default transporter;