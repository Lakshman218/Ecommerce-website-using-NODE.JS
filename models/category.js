const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema ({
  catgName:{
    require: true,
    type: String,
    unique: true,
  },
  catgDiscription:{
    require: true,
    type: String,
  },
  categoryStatus: {
    require: true,
    type: String,
  },
  offerStart: Date,
  offerEnd: Date,
  discountPercent:Number,
  discountStatus: {
    type: String,
    default:"Active",
  },
});

const categoryCollection = mongoose.model("categoryCollection", categorySchema);
module.exports = categoryCollection;