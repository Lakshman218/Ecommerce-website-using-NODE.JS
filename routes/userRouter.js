const express = require("express");
const   userRouter = express.Router();
const cookieparser = require("cookie-parser");
const jwt = require("jsonwebtoken");
userRouter.use(cookieparser());
userRouter.use(express.json());

const userMiddleware = require("../middlewares/user_authentication");
const loginControll = require("../controllers/user_controllers/login");
const signupControll = require("../controllers/user_controllers/signup");
const homepageControll = require("../controllers/user_controllers/homepage");
const productControll = require("../controllers/user_controllers/productdetails");
const cartControll = require("../controllers/user_controllers/cartdetails");
const checkoutControll = require("../controllers/user_controllers/checkout");
const accountControll = require("../controllers/user_controllers/account");
const filterControll = require("../controllers/user_controllers/categoryFilter"); 
const whishlistControl = require("../controllers/user_controllers/whishlistdetails");
const incvoiceControll = require("../controllers/user_controllers/downloadInvoice")
const forgotpasswordControll = require("../controllers/user_controllers/forgotPassword")


// homepage 
userRouter.get("/", homepageControll.getUserRoute);
userRouter.get("/logout",homepageControll.getLogout);

// login
userRouter.get("/login", loginControll.getLogin)
userRouter.post("/post-login",loginControll.postLogin)

// forgot password
userRouter.get("/forgot-password", forgotpasswordControll.getforgotPassword)
userRouter.get("/passwordresetotp", forgotpasswordControll.passwordResetOtp)
userRouter.post("/verifypasswordresetotp", forgotpasswordControll.verifyPasswordResetOtp)
userRouter.get("/changePassword", forgotpasswordControll.changePassword)
userRouter.post("/savechangePassword", forgotpasswordControll.saveChangePassword)


// signup
userRouter.get("/signup", signupControll.getUserSignup)
userRouter.post("/post-signup", signupControll.postUserSignup)
userRouter.get("/send-otp", signupControll.getSendOtp)
userRouter.post("/verify-otp",signupControll.postVerifyOtp)

// product
userRouter.get("/product-details/:productId",  userMiddleware.verifyUser, userMiddleware.checkBlockedStatus,  productControll.productDetails)

// cart
userRouter.get("/cart", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, cartControll.getCart)
userRouter.post("/add-cart", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, cartControll.addCart)
userRouter.get("/delete-cart",  userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, cartControll.deleteCart)
userRouter.put("/manage-quantity",userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, cartControll.manageQuantity)
userRouter.get("/get-subtotal", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, cartControll.subtotal)

// whishlist
userRouter.get("/whishlist", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, whishlistControl.getWhishlist)
userRouter.post("/add-whishlist", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, whishlistControl.addWhishlist)
userRouter.get("/delete-whishlist/:productId", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, whishlistControl.deleteWhishlist)


// checkout
userRouter.get("/checkout", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.getCheckout)
userRouter.get("/get-grandtotal", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.grandtotal)
userRouter.post("/add-coupon", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.applyCoupon)
userRouter.post("/remove-coupon", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.removeCoupon)
userRouter.get("/order-placed", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.getPlaceOrder)
userRouter.post("/cashOnDelivery", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.cashOnDelivery)
userRouter.post("/razorpay", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.razorpayOrder)
userRouter.get("/razorpayorder-placed", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.razorpayOrderPlaced)
userRouter.post("/walletPay", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, checkoutControll.walletPay)


// account
userRouter.get("/account", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.getUserAccount)
userRouter.get("/get-usereditdetails", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.getUsereditdetails)
userRouter.post("/post-userupdatedetails", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.postUserupdateddetails)
userRouter.get("/get-changepswd", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.getChangepswd)
userRouter.post("/post-changedpswd", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.postChangedswd)
userRouter.get("/get-changeemail", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.getChangeEmail)
userRouter.get("/newsend-otp", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.newSendotp)
userRouter.post("/newverify-otp", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.newVerifyotp)
userRouter.get("/get-address", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.addAddress)
userRouter.post("/post-address", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.postAddress)
userRouter.get("/edit-address/:objectId/:addressId", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.editAddress)
userRouter.post("/post-editedaddress", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.postEditedaddress)
userRouter.get("/order-details/:orderId", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.getOrderdetails)
userRouter.post("/cancel-order", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.cancelOrder)
userRouter.post("/cancelSingle-order", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.cancelSingleOrder)
userRouter.post("/return-order", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.returnOrder)
userRouter.get("/get-coupons", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.getCoupons)
userRouter.post("/applyreferel", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, accountControll.applyReferelOffers)

// filter
userRouter.post("/filter-category", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, filterControll.filterCategory)
userRouter.post("/search", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, filterControll.searchProducts)

// Download Invoice
// userRouter.get("/download-Invoice", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, incvoiceControll.downloadInvoice)
userRouter.get("/get-Invoice", userMiddleware.verifyUser, userMiddleware.checkBlockedStatus, incvoiceControll.getInvoice)



module.exports = userRouter;