const userCollection = require("../../models/user_schema");
const productCollection = require("../../models/product");
const cartCollection = require("../../models/cart");
const whishlistCollection = require("../../models/whishlist");

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const secretkey = process.env.JWT_SECRET_KEY;
const offerController = require("../admin_controllers/adm_offermanage");

// render whishlist
module.exports.getWhishlist = async (req, res) => {
  try {
    await offerController.deactivateExpiredOffers();
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    const userId = userData._id;
    const loggedIn = req.cookies.loggedIn;
    const whishlistDetails = await whishlistCollection
      .findOne({ userId: userId })
      .populate("products.productId");

    res.render("user-whishlist", { loggedIn, username, whishlistDetails });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// add product to whishlist
module.exports.addWhishlist = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;
    const productId = req.query.productId;

    const existingWishlist = await whishlistCollection.findOne({ userId });

    if (existingWishlist) {
      const existingProduct = existingWishlist.products.find(
        (product) => product.productId.toString() === productId
      );

      if (existingProduct) {
        return res
          .status(200)
          .json({ existing: true, message: "Product already in the Wishlist" });
      } else {
        existingWishlist.products.push({
          productId: new mongoose.Types.ObjectId(productId),
        });
        await existingWishlist.save();
      }
    } else {
      const newWishlist = new whishlistCollection({
        userId,
        products: [{ productId: new mongoose.Types.ObjectId(productId) }],
      });
      await newWishlist.save();
    }

    res.json({ message: "Product added to the Wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// delete whishlist
module.exports.deleteWhishlist = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;
    const productId = req.params.productId;
    const updateWhishlist = await whishlistCollection.updateOne(
      { userId: userId },
      {
        $pull: {
          products: {
            productId: productId,
          },
        },
      }
    );
    res.redirect("/whishlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
