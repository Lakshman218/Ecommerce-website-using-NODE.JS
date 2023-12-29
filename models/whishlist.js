const mongoose = require("mongoose")
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userCollection"
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productCollection"
      },
    },
  ],
});

const whishlistCollection = mongoose.model("whishlistCollection", wishlistSchema)
module.exports = whishlistCollection;