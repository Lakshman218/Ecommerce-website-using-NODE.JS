const mongoose = require("mongoose");
const orderCollection = require("../../models/order");
const userCollection = require("../../models/user_schema");
const productCollection = require("../../models/product");

// render order manage page
module.exports.getOrderlist = async (req, res) => {
  try {
    const orderDetails = await orderCollection
      .find()
      .populate("products.productId")
      .populate("userId");
    res.render("admin-orderlist", { orderDetails });
  } catch (error) {
    console.error("Error:", error);
  }
};

// render order details page
module.exports.getOrdermanage = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetails = await orderCollection
      .findById({ _id: orderId })
      .populate("products.productId")
      .populate("userId");
    res.render("admin-ordermanage", { orderDetails });
  } catch (error) {
    console.error("Error:", error);
  }
};

// dispatch order
module.exports.dispatchOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderData = await orderCollection.findById(orderId);

    if (orderData.orderStatus !== "Order Placed") {
      return res
        .status(400)
        .json({ error: "Order has already been shipped or cancelled" });
    }

    // Update the status of each product in the order
    for (const product of orderData.products) {
      if (product.status === "Order Placed") {
        product.status = "Shipped";

        // const productDoc = await productCollection.findById(product.productId);
        // if (productDoc) {
        //   productDoc.productStatus = "Shipped";
        //   await productDoc.save();
        // }
      }
    }

    orderData.orderStatus = "Shipped";
    await orderData.save();

    res.status(200).json({ message: "The order is shipped" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// deliver order
module.exports.deliverOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderData = await orderCollection.findById(orderId);

    // Update the status of each product in the order
    for (const product of orderData.products) {
      if (product.status === "Shipped") {
        product.status = "Delivered";

        // const productDoc = await productCollection.findById(product.productId);
        // if (productDoc) {
        //   productDoc.productStatus = "Delivered";
        //   await productDoc.save();
        // }
      }
    }
    orderData.orderStatus = "Delivered";
    orderData.paymentStatus = "Success";
    orderData.deliveryDate = Date.now();

    const expiryDate = new Date(orderData.deliveryDate);
    expiryDate.setDate(expiryDate.getDate() + 2);

    orderData.expiryDate = expiryDate;

    await orderData.save();

    res.status(200).json({ message: "The order is delivered" });
  } catch (error) {
    console.error("Error:", error);
  }
};

// cancel order
module.exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderData = await orderCollection.findById(orderId);
    const productIds = orderData.products.map((product) => product.productId);
    const productData = await productCollection.find({
      _id: { $in: productIds },
    });

    const totalProductAmount = orderData.products
      .filter((product) => product.status !== "Cancelled")
      .reduce((total, product) => total + product.orderPrice, 0);

    // updating stock
    for (const product of productData) {
      const orderProduct = orderData.products.find((orderProduct) =>
        orderProduct.productId.equals(product._id)
      );
      product.productStock += orderProduct.quantity;
      await product.save();
    }

    orderData.products.forEach((product) => {
      product.status = "Cancelled";
    });
    await orderData.save();

    // updating status
    orderData.orderStatus = "Cancelled";
    orderData.payableAmount -= totalProductAmount;
    await orderData.save();

    // updating payment
    if (
      orderData.paymentMethod == "Online payment" ||
      orderData.paymentMethod == "Wallet"
    ) {
      const userWallet = await walletCollection.findOne({ userId: userId });
      const walletAmout = userWallet.amount ?? 0;
      const totalOrderAmount = totalProductAmount ?? 0;
      const newWalletAmount = walletAmout + totalOrderAmount;

      if (orderData.paymentStatus == "Success") {
        await walletCollection.updateOne(
          { userId: userId },
          { $set: { amount: newWalletAmount } }
        );
      }
    } else if (orderData.paymentMethod == "Cash On Delivery") {
      if (orderData.orderStatus == "Delivered") {
        const userWallet = await walletCollection.findOne({ userId: userId });
        const walletAmout = userWallet.amount ?? 0;
        const totalOrderAmount = totalProductAmount ?? 0;
        const newWalletAmount = walletAmout + totalOrderAmount;

        if (orderData.paymentStatus == "Success") {
          await walletCollection.updateOne(
            { userId: userId },
            { $set: { amount: newWalletAmount } }
          );
        }
      }
    }

    res.status(200).json({ message: "The order is cancelled" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error found while cancelling product" });
  }
};
