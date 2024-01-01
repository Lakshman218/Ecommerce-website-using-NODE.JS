const userCollection = require("../../models/user_schema");
const adminCollection = require("../../models/admin_schema");
const productCollection = require("../../models/product");
const walletCollection = require("../../models/wallet");
var randomstring = require("randomstring");
const bcrypt = require("bcrypt");

require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretkey = process.env.JWT_SECRET_KEY;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const nodemailer = require("nodemailer");
// const nodemailer_pswd = process.env.nodemailer

//  user signup
module.exports.getUserSignup = (req, res) => {
  res.render("user-signup");
};

// creating a user in usersignup
module.exports.postUserSignup = async (req, res) => {
  const email = await userCollection.findOne({ email: req.body.email });
  const phoneNumber = await userCollection.findOne({
    phoneNumber: req.body.phoneNumber,
  });
  let codeId = randomstring.generate(12);

  if (email) {
    res.render("user-signup", { error: "Email already exists" });
  } else if (phoneNumber) {
    res.render("user-signup", { error: "PhoneNumber already exists" });
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await userCollection.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      status: "Unblock",
      referelId: codeId,
    });
    const currUser = await userCollection.findOne({ email: req.body.email });
    await walletCollection.create({
      userId: currUser._id,
      amount: 0,
    });
    res.render("user-login", { message: "User sign up successfully" });
  }
};

// generating otp for node mailer
let generatedOTP = null;
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// sending otp
module.exports.getSendOtp = async (req, res) => {
  try {
    const phoneNumber = req.query.phoneNumber;
    const existingUser = await userCollection.findOne({
      $or: [{ email: req.query.email }, { phoneNumber: phoneNumber }],
    });
    if (existingUser) {
      // Handle the case where either email or phoneNumber already exists
      // if (existingUser.email === req.query.email && existingUser.phoneNumber === req.query.phoneNumber) {
      res.status(200).json({ error: "User already exists" });
      // } else  {
      // res.status(200).json({error: "User already exists"})
      // }
    } else {
      const email = req.query.email;

      generatedOTP = generateOTP();
      console.log(generatedOTP);

      // Create a Transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "lakshmans218@gmail.com",
          pass: "ueha hqfq nnxr oqcc",
        },
      });

      //  Compose and Send an Email
      const mailOptions = {
        from: "lakshmans218@gmail.com",
        to: email,
        subject: "Account verification mail",
        text: `Your OTP for verification is: ${generatedOTP}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Email has been sent: " + info.response);
        }
      });

      res.status(200).json({ message: "OTP send to email successfully" });
    }
  } catch (error) {
    console.error(error);
  }
};

// verify otp
module.exports.postVerifyOtp = async (req, res) => {
  try {
    const userEnteredOTP = req.query.otpInput;

    if (
      userEnteredOTP &&
      generatedOTP &&
      userEnteredOTP === generatedOTP.toString()
    ) {
      // OTP is correct
      res.status(200).json({ message: "OTP verification successful" });
    } else {
      // Incorrect OTP
      res.status(400).json({ error: "Incorrect OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
