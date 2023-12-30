const userCollection = require("../../models/user_schema");
const adminCollection = require("../../models/admin_schema");
const productCollection = require("../../models/product");
const bcrypt = require("bcrypt");

require('dotenv').config();
const jwt = require("jsonwebtoken");
const secretkey = process.env.JWT_SECRET_KEY


// gettting login page
module.exports.getLogin = (req,res) => {
  const isLoggedIn = req.cookies.loggedIn;
  if(isLoggedIn) {
    res.redirect("/");
  } else { 
    res.render("user-login");
  }
}



// checking user details and loging
module.exports.postLogin = async (req, res) => {
  try {
    const logindata = await userCollection.findOne({ email: req.body.email });

    if (!logindata) {
      return res.status(200).json({ error: "The email is not registered" });
    }

    if (logindata.status === "Block") {
      return res.status(200).json({ error: "User is blocked" });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      logindata.password
    );

    if (!passwordMatch) {
      return res.status(200).json({ error: "Incorrect password" });
    }

    if (passwordMatch) {
      email = req.body.email;
      const token = jwt.sign(email, secretkey);
      res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 });
      res.cookie("loggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });
      res.cookie("username", logindata.username);
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

  



