const userCollection = require("../../models/user_schema");
const productCollection = require("../../models/product");
const cartCollection = require("../../models/cart");
const addressCollection = require("../../models/address");
const orderCollection = require("../../models/order");
const couponCollection = require("../../models/coupons");
const nodemailer = require("nodemailer");
const walletCollection = require("../../models/wallet");
const bcrypt = require("bcrypt");

// render account page
module.exports.getUserAccount = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;

    // const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;
    const addressDetails = await addressCollection.findOne({ userId: userId });
    const orderDetails = await orderCollection
      .find({ userId: userId })
      .populate("products.productId");
    const wallet = await walletCollection.findOne({ userId: userId });

    // res.render("user-account",{ loggedIn,username,addressDetails })
    res.render("user-account", {
      loggedIn,
      username,
      addressDetails,
      orderDetails,
      userData,
      wallet,
    });
  } catch (error) {
    console.error("error: ", error);
  }
};

//  render user edit details page
module.exports.getUsereditdetails = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    // const userData = await userCollection.findOne({ email: req.user });
    res.render("user-edituserdetails", { loggedIn, username, userData });
  } catch (error) {
    console.error("Error:", error);
  }
};

// saving user updated details
module.exports.postUserupdateddetails = async (req, res) => {
  const username = req.body.username;
  // const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;

  const userData = await userCollection.findOne({ email: req.user });
  const userId = userData._id;

  try {
    const existingUser = await userCollection.findOne({
      $and: [
        { phoneNumber: phoneNumber },
        { _id: { $ne: userId } }, // Exclude the current user's ID
      ],
    });

    if (!existingUser) {
      const updatedUser = await userCollection.findByIdAndUpdate(
        userId,
        {
          $set: {
            username: username,
            // email: email,
            phoneNumber: phoneNumber,
          },
        },
        { new: true }
      );
      res.status(200).json({ message: "Updated successfully" });
    } else {
      res.status(404).json({ error: "User already exists" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "User already exists" });
  }
};

// render change password page
module.exports.getChangepswd = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    res.render("user-changepswd", { loggedIn, username });
  } catch (error) {
    console.error("Error:", error);
  }
};

// save changed password
module.exports.postChangedswd = async (req, res) => {
  try {
    const oldpassword = req.body.oldpassword;
    const newpassword = req.body.newpassword;
    const confirmpassword = req.body.confirmpassword;

    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;
    const passwordMatch = await bcrypt.compare(oldpassword, userData.password);
    if (!passwordMatch) {
      console.log("server");
      return res.status(200).json({ IncorrectOld: true });
    }
    if (oldpassword === newpassword) {
      return res.status(200).json({ samepassword: true });
    }

    const hashedNewPassword = await bcrypt.hash(newpassword, 10);
    await userCollection.findByIdAndUpdate(
      userId,
      { $set: { password: hashedNewPassword } },
      { new: true }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// render change email page
module.exports.getChangeEmail = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    res.render("user-changeemail", { loggedIn, username });
  } catch (error) {
    console.error("Error:", error);
  }
};

// otp generator
let generatedOTP = null;
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// send otp
module.exports.newSendotp = async (req, res) => {
  try {
    const existingUser = await userCollection.findOne({
      email: req.query.email,
    });
    if (existingUser) {
      res.status(200).json({ error: "User already exists" });
    } else {
      const email = req.query.email;

      generatedOTP = generateOTP();
      console.log("GeneratedOTP: ", generatedOTP);

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
module.exports.newVerifyotp = async (req, res) => {
  try {
    const userEnteredOTP = req.query.otpInput;
    const newemail = req.query.email;
    console.log(" in contro", userEnteredOTP, newemail);

    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;
    console.log("user id: ", userId);

    if (
      userEnteredOTP &&
      generatedOTP &&
      userEnteredOTP == generatedOTP.toString()
    ) {
      await userCollection.findOneAndUpdate(
        userId,
        { $set: { email: newemail } },
        { new: true }
      );
      res.status(200).json({ message: "Email updated successful" });
    } else {
      res.status(400).json({ error: "Incorrect OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// render add address form page
module.exports.addAddress = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    const source = req.query.source;
    console.log(source);
    res.render("user-address", { loggedIn, username, source });
  } catch (error) {
    console.error("error: ", error);
  }
};

// add address
module.exports.postAddress = async (req, res) => {
  const source = req.query.source;
  console.log(source);
  const userData = await userCollection.findOne({ email: req.user });
  const userId = userData._id;

  const username = req.body.username;
  const addressType = req.body.address;
  const city = req.body.city;
  const landmark = req.body.landmark;
  const state = req.body.state;
  const postcode = req.body.postcode;
  const phoneNumber = req.body.phoneNumber;
  const altphone = req.body.altphone;

  try {
    let userAddress = await addressCollection.findOne({ userId });

    if (!userAddress) {
      // If userAddress does not exist, create a new document
      userAddress = new addressCollection({
        userId,
        address: [
          {
            userName: username,
            addressType: addressType,
            city: city,
            landmark: landmark,
            state: state,
            postcode: postcode,
            phoneNumber: phoneNumber,
            altphone: altphone,
          },
        ],
      });
    } else {
      // If userAddress exists, push the new address to the array
      userAddress.address.push({
        userName: username,
        addressType: addressType,
        city: city,
        landmark: landmark,
        state: state,
        postcode: postcode,
        phoneNumber: phoneNumber,
        altphone: altphone,
      });
    }

    await userAddress.save();
    // res.status(200).json({ message: "Address added successfully" });
    if (source == "profile") {
      res.redirect("/account");
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Unable to insert" });
  }
};

// render edit address $ pass data
module.exports.editAddress = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    const objectId = req.params.objectId;
    const addressId = req.params.addressId;

    const addressDetails = await addressCollection.findOne(
      { _id: objectId, "address._id": addressId },
      { "address.$": 1 }
    );
    // console.log(addressDetails);

    res.render("user-editaddress", { loggedIn, username, addressDetails });
  } catch (error) {
    console.error("Error:", error);
  }
};

// save edited address
module.exports.postEditedaddress = async (req, res) => {
  try {
    const addressId = req.body.addressId;
    const userName = req.body.userName;
    const addressType = req.body.addressType;
    const city = req.body.city;
    const landmark = req.body.landmark;
    const state = req.body.state;
    const postcode = req.body.postcode;
    const phoneNumber = req.body.phoneNumber;
    const altphone = req.body.altphone;

    const updatedAddress = await addressCollection.findOneAndUpdate(
      { "address._id": addressId },
      {
        $set: {
          "address.$.userName": userName,
          "address.$.addressType": addressType,
          "address.$.city": city,
          "address.$.landmark": landmark,
          "address.$.state": state,
          "address.$.postcode": postcode,
          "address.$.phoneNumber": phoneNumber,
          "address.$.altphone": altphone,
        },
      },
      { new: true }
    );
    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("Error:", error);
  }
};

// render order details
module.exports.getOrderdetails = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    userId = userData._id;
    const currentDate = Date.now();
    const Idorder = req.params.orderId;
    if (Idorder) {
      const orderDetails = await orderCollection
        .findById({ _id: Idorder })
        .populate("products.productId");
      res.render("user-orderDetails", {
        loggedIn,
        username,
        orderDetails,
        currentDate,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};

// cancel order
module.exports.cancelOrder = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;

    const orderId = req.query.orderId;
    const cancelReason = req.query.reason;

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
    orderData.cancelReason = cancelReason;
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
        await orderCollection.updateOne(
          { _id: orderId },
          { $set: { paymentStatus: "Repayed" } }
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
          await orderCollection.updateOne(
            { _id: orderId },
            { $set: { paymentStatus: "Repayed" } }
          );
        }
      }
    }

    res.status(200).json({ message: "The order is cancelled" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Error found while cancelling product" });
  }
};

// cancel single order
module.exports.cancelSingleOrder = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;

    const orderId = req.query.orderId;
    const productId = req.query.productId;
    console.log(orderId, productId);
    const orderData = await orderCollection.findById(orderId);
    const product = orderData.products.find((item) =>
      item.productId.equals(productId)
    );
    const productAmount = product.orderPrice;
    console.log("productAmount: ", productAmount);

    // updating status
    const updateStatus = { $set: { "products.$.status": "Cancelled" } };
    const updatedOrder = await orderCollection.findOneAndUpdate(
      { _id: orderId, "products.productId": productId },
      updateStatus,
      { new: true }
    );

    orderData.payableAmount -= productAmount;
    await orderData.save();

    // updating stock
    for (const orderProduct of orderData.products) {
      const product = await productCollection.findById(orderProduct.productId);
      product.productStock += orderProduct.quantity;
      await product.save();
    }

    // refunding amount
    if (
      orderData.paymentMethod == "Online payment" ||
      orderData.paymentMethod == "Wallet"
    ) {
      const userWallet = await walletCollection.findOne({ userId: userId });
      const walletAmout = userWallet.amount ?? 0;
      const totalOrderAmount = productAmount ?? 0;
      const newWalletAmount = walletAmout + totalOrderAmount;

      if (orderData.paymentStatus == "Success") {
        await walletCollection.updateOne(
          { userId: userId },
          { $set: { amount: newWalletAmount } }
        );
      }
    }

    res.status(200).json({ message: "The order is cancelled" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Error found while cancelling product" });
  }
};

// return order
module.exports.returnOrder = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;

    const orderId = req.query.orderId;
    const returnReason = req.query.reason;
    const orderData = await orderCollection.findById(orderId);
    const deliveryDate = orderData.deliveryDate;
    const productIds = orderData.products.map((product) => product.productId);
    const productData = await productCollection.find({
      _id: { $in: productIds },
    });

    const totalProductAmount = orderData.products
      .filter((product) => product.status !== "Cancelled")
      .reduce((total, product) => total + product.orderPrice, 0);

    for (const product of productData) {
      const orderProduct = orderData.products.find((orderProduct) =>
        orderProduct.productId.equals(product._id)
      );
      product.productStock += orderProduct.quantity;
      await product.save();
    }

    orderData.products.forEach((product) => {
      if (product.status == "Delivered") {
        product.status = "Returned";
      }
    });
    await orderData.save();

    // save the order status
    orderData.orderStatus = "Returned";
    orderData.paymentStatus = "Repayed";
    orderData.returnReason = returnReason;
    await orderData.save();

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

    res.status(200).json({ message: "The order is Returned" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Error found while returning product" });
  }
};

// get coupon page
module.exports.getCoupons = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;

    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    const userId = userData._id;

    const coupondata = await couponCollection.find();
    const coupons = coupondata.filter((coupons) => coupons.status !== "Block");

    res.render("user-coupons", { loggedIn, username, coupons, userId });
  } catch (error) {
    console.error("Error: ", error);
  }
};

// apply referal
module.exports.applyReferelOffers = async (req, res) => {
  try {
    const referelcode = req.query.referel;
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;

    const usedReferel = await userCollection.findOne({
      referelId: referelcode,
    });
    const myReferelCode = userData.referelId;

    if (usedReferel) {
      if (usedReferel.redmmedreferels.includes(userData._id)) {
        res.status(400).send({ data: "Offer already redeemed by the user" });
      } else if (referelcode === myReferelCode) {
        res.status(400).send({ data: "Unable to apply yourself" });
      } else {
        usedReferel.redmmedreferels.push(userData._id);
        await usedReferel.save();
        await userCollection.updateOne(
          { _id: userData._id },
          { $set: { appliedReferel: true } }
        );

        const userWallet = await walletCollection.findOne({
          userId: userData._id,
        });
        userWallet.amount += 100;
        await userWallet.save();

        const referedUserWallet = await walletCollection.findOne({
          userId: usedReferel._id,
        });
        referedUserWallet.amount += 200;
        await referedUserWallet.save();

        res.status(200).send({ data: "Offer redeemed successfully" });
      }
    } else {
      res.status(500).send({ data: "Invalid referral code" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ data: "Internal Server Error" });
  }
};
