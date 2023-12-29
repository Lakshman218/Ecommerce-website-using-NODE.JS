const categoryCollection = require("../../models/category");
const productCollection = require("../../models/product");
const userCollection = require("../../models/user_schema")
const offerCollection = require("../../models/offer");
const offerController = require("../admin_controllers/adm_offermanage")

const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const couponCollection = require("../../models/coupons");
require("dotenv").config();


// filter
module.exports.filterCategory = async (req, res) => {
  try {
    await offerController.deactivateExpiredOffers();
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({ email: req.user });
    const username = userData.username;
    let productdata;
    let { sort, categories } = req.body;

    sort = (sort == "highToLow") ? 1 : -1;

    const categorydata = await categoryCollection.find({});
    const offerData = await offerCollection.find({ isActive: true, status: "Unblock" })

    if (sort && categories) {
      const category = await categoryCollection.findById(categories);
      const categoryName = category.catgName;

      productdata = await productCollection
        .find({ productCategory: categoryName })
        .sort({ sellingPrice: sort });
      productdata = productdata.filter(product => product.productStatus !== 'Block');
      const productCount = productdata.length;

      res.render("userIndex", { username, loggedIn, productdata, categorydata, productCount, offerData });
    } else {
      productdata = await productCollection.find({})
        .sort({ sellingPrice: sort });
      productdata = productdata.filter(product => product.productStatus !== 'Block');
      const productCount = productdata.length;
      res.render("userIndex", { username, loggedIn, productdata, categorydata, productCount, offerData });
    }
  } catch (error) {
    console.log(error);
  }
};



// search 
module.exports.searchProducts = async(req,res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const userData = await userCollection.findOne({email: req.user})
    const username = userData.username;
    const { search_product } = req.body;

      // decoding from token
      const token = req.cookies.token;
      const verifyToken = jwt.verify(
        token, 
        process.env.JWT_SECRET_KEY,
        (err, decoded) => {
          if(err) {
            // return res.redirect ("/login");
            console.log("error")
          }
          req.user = decoded;
        })
    
        const categorydata = await categoryCollection.find();
        const category = categorydata.filter(category => category.categoryStatus !== 'Block');

        let productdata = await productCollection.find();
        productdata = productdata.filter(product => product.productStatus !== 'Block');

      if(search_product) {
        const regexPattern = new RegExp(search_product, 'i');
       productdata = await productCollection.find({
        $and: [
          {
            $or: [
              { productName: { $regex: regexPattern } },
              { productCategory: { $regex: regexPattern } },
              { productBrand: { $regex: regexPattern } },
            ],
          },
          { productStatus: 'Unblock' },
        ],
      });
      }
    

      if(req.user){
        const userData = await userCollection.findOne({email:req.user})
        const username = userData.username;
        res.render("userIndex", { loggedIn, username, productdata, categorydata: category });
      } else {
        res.render("userIndex", { loggedIn, productdata, categorydata: category });
      }

  } catch(error) {
    console.error("Error:", error);
  }
}