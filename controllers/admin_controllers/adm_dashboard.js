const mongoose = require("mongoose")
const orderCollection = require("../../models/order");
const userCollection = require("../../models/user_schema");
const productCollection = require("../../models/product");

module.exports.salesReport = async(req,res) => {
  try{
    const orderData = await orderCollection.find({orderStatus: "Delivered"})
    res.render("admin-salesReport", {orderData})
  } catch(error) {
    console.log("Error: ", error)
  }
}

module.exports.filterSales = async(req,res) => {
  try {
    const startDate = req.body.startDate
    const endDate = req.body.endDate

    const orderData = await orderCollection.find({
      orderStatus: "Delivered",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.render("admin-salesReport", { orderData });
  } catch(error) {
    console.log("Error: ", error)
  }
}