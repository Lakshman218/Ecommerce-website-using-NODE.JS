const userCollection = require("../../models/user_schema");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require("bcrypt");

app.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');

// render forgotpassword page
module.exports.getforgotPassword = async(req,res) => {
  try {
    res.render("user-forgotpassword")
  } catch (error) {
    console.error("Error:", error)
  }
}

// generating otp for node mailer
let generatedOTP = null;
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

module.exports.passwordResetOtp = async (req,res) => {
  try {
    const email = req.query.email;
    console.log("email", email);  
    const existingUser = await userCollection.findOne({ email: email });
    if (!existingUser) {
        res.status(200).json({error: "No user found on this Email Try again with registered Email ID."})
  } else 
  {

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
      from: 'lakshmans218@gmail.com',
      to: email,
      subject: 'Account verification mail',
      text: `Your OTP for verification is: ${generatedOTP}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email has been sent: ' + info.response);
      }
    });
  
    res.status(200).json({message: "OTP send to email successfully"})
  }
  } catch (error) {
    console.error(error)
  }
} 


// verify otp
module.exports.verifyPasswordResetOtp = async (req, res) => {
  try {
    
    const userEnteredOTP = req.query.otpInput;

    if (userEnteredOTP && generatedOTP && userEnteredOTP === generatedOTP.toString()) {
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
}

module.exports.changePassword = async(req,res) => {
  try {
    const email = req.query.email
    res.render("user-resetpassword", {email})
  } catch (error) {
    console.error("Error:", error)
  }
}

// saving changed password
module.exports.saveChangePassword = async (req, res) => {
  try {
    const email = req.body.email;
    const password1 = req.body.password1;
    console.log(password1);
    const password2 = req.body.password2;

    // Find the user by email
    const userDataArray = await userCollection.find({ email: email });

    if (userDataArray.length > 0) {
      const userId = userDataArray[0]._id;

      // Update the password
      const hashedNewPassword = await bcrypt.hash(password1, 10);
      console.log(hashedNewPassword);
      await userCollection.findByIdAndUpdate(
        userId,
        { $set: { password: hashedNewPassword } },
        { new: true }
      );

      console.log("Success");
      res.render("user-login")
    } else {
      console.log("User not found");
      res.render("user-forgotpassword");
    }
  } catch (error) {
    console.error("Error:", error);
    res.render("error-page");
  }
};
