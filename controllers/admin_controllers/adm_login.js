const mongoose = require("mongoose");
const multer = require("multer");
//const {uploads} = require("../multer-middleware/multer_middleware")

const adminCollection = require("../../models/admin_schema");

require('dotenv').config();
const jwt = require("jsonwebtoken");
const orderCollection = require("../../models/order");
const productCollection = require("../../models/product");
const categoryCollection = require("../../models/category");
const secretkey = process.env.JWT_SECRET_KEY


// render loging page
module.exports.getAdminLogin = (req, res) => {
  // Check if the admin is already logged in
  const isLoggedIn = req.cookies.Admintoken;
  
  if (isLoggedIn) {
    // If admin is logged in, redirect to admin dashboard
    res.redirect("/admin/admin-dash");
  } else {
    // If admin is not logged in, render the login page
    res.render("admin-login");
  }
};

// checking details and loging
module.exports.adminPostLogin = async(req,res) => {
  const admindata = await adminCollection.findOne({ email: req.body.email});
  if (!admindata) {
    res.render("admin-login", {subreddit: "The emial is not registered"});
  } else {
    if (admindata){
      if (req.body.email != admindata.email) 
      {
        res.render("admin-login", {subreddit:"This email not registered"});
      } else if (req.body.password != admindata.password) 
      {
        res.render("admin-login", {subreddit: "Incorrect passaword"});
      } else 
      {
        if ( req.body.email == admindata.email && req.body.password == admindata.password ) 
        { 
          try {
          email = req.body.email;
          const token = jwt.sign(email, secretkey);
          res.cookie("Admintoken", token, { maxAge: 24 * 60 * 60 * 1000 });
          res.cookie("AdminloggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });
          res.status(200);
          // res.render("admin-dashboard")
            res.redirect("/admin/admin-dash")
          } catch (error) {
              console.log(error);
              res.status(500).json({ error: "Internal Server Error" });
          }
        } 
      }
    } else {
      res.redirect("/admin");
    }
  }
}

module.exports.getAdminDashboard = async(req,res) => {
  try {
    const orders = await orderCollection.find()
    const numberOfOrders = await orderCollection.countDocuments();
    const numberOfProducts = await productCollection.countDocuments();
    const numberOfCategories = await categoryCollection.countDocuments();
    const result  = await orderCollection.aggregate([
      {
        $group: {
          _id: null, 
          totalRevenue: {$sum: "$totalAmount"},
        },
      },
    ]).exec();
    const profit  = await orderCollection.aggregate([
      {
        $group: {
          _id: null, 
          totalEarnings: {$sum: "$payableAmount"},
        },
      },
    ]).exec();
    const revenue = result.length > 0 ? result[0].totalRevenue : 0;
    const earnings = profit.length > 0 ? profit[0].totalEarnings : 0;
    
    res.render("admin-dashboard", {numberOfOrders, numberOfProducts, numberOfCategories, revenue, earnings })
  } catch (error) {
    console.error(error)
  }
}

// logout
module.exports.getLogout = async (req,res) => {
  res.clearCookie("Admintoken");
  res.clearCookie("loggedIn");
  res.redirect("/admin")
}


