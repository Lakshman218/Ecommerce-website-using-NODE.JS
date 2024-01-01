const mongoose = require("mongoose");
const orderCollection = require("../../models/order");
const userCollection = require("../../models/user_schema");
const productCollection = require("../../models/product");
const categoryCollection = require("../../models/category");

module.exports.salesReport = async (req, res) => {
  try {
    const orderData = await orderCollection.find({ orderStatus: "Delivered" });
    res.render("admin-salesReport", { orderData });
  } catch (error) {
    console.log("Error: ", error);
  }
};

module.exports.filterSales = async (req, res) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const orderData = await orderCollection.find({
      orderStatus: "Delivered",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.render("admin-salesReport", { orderData });
  } catch (error) {
    console.log("Error: ", error);
  }
};

module.exports.filterOrder = async (req, res) => {
  try {
    const orders = await orderCollection.find();
    const numberOfOrders = await orderCollection.countDocuments();
    const numberOfProducts = await productCollection.countDocuments();
    const numberOfCategories = await categoryCollection.countDocuments();
    const result = await orderCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ])
      .exec();
    const profit = await orderCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$payableAmount" },
          },
        },
      ])
      .exec();
    const revenue = result.length > 0 ? result[0].totalRevenue : 0;
    const earnings = profit.length > 0 ? profit[0].totalEarnings : 0;

    

    let filteroption = req.body.filteroption;
    filteredData = await orderCollection.find();

    if (filteroption == "All") {
      filteredData = await orderCollection.find();
    } else if (filteroption == "Order Placed") {
      filteredData = await orderCollection.find({ orderStatus: "Order Placed" });
    } else if (filteroption == "Delivered") {
      filteredData = await orderCollection.find({ orderStatus: "Delivered" });
    } else if (filteroption == "Returned") {
      filteredData = await orderCollection.find({ orderStatus: "Returned" });
    }

    res.render("admin-dashboard", {
      numberOfOrders,
      numberOfProducts,
      numberOfCategories,
      revenue,
      earnings,
      filteredData,
    });
  } catch (error) {
    console.log("Error: ", error);
  }
};

