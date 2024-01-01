const userCollection = require("../../models/user_schema");
const productCollection = require("../../models/product");
const cartCollection = require("../../models/cart");
const addressCollection = require("../../models/address");
const orderCollection = require("../../models/order");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// download invoice
// module.exports.downloadInvoice = async (req, res) => {
//   try {
//     const orderId = req.query.orderId;
//     const orderData = await orderCollection.findById(orderId);

//     if (!orderData) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Find user details using userId
//     const userData = await userCollection.findById(orderData.userId);

//     if (!userData) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Create a PDF document
//     const doc = new PDFDocument();

//     // Set response headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

//     // Pipe the PDF to the response stream
//     doc.pipe(res);

//     // Add content to the PDF
//     doc.fontSize(14).text(`Invoice for Order: ${orderId}`, { align: 'center' });
//     doc.moveDown();
//     doc.text(`Order Date: ${orderData.createdAt.toLocaleDateString()}`);
//     doc.text(`Delivery Date: ${orderData.deliveryDate ? orderData.deliveryDate.toLocaleDateString() : 'N/A'}`);
//     doc.moveDown();

//     // User details
//     doc.fontSize(12).text('User Details:', { underline: true });
//     doc.moveDown();
//     doc.text(`Name: ${userData.username}`);
//     doc.text(`Email: ${userData.email}`);

//     // Product details
//     doc.fontSize(12).text('Product Details:', { underline: true });
//     doc.moveDown();
//     orderData.products.forEach((product) => {
//       doc.text(`Product: ${product.productId.productName}`);
//       doc.text(`Price: ₹${product.price}`);
//       doc.text(`Quantity: ${product.quantity}`);
//       doc.text(`Status: ${product.status}`);
//       doc.moveDown();
//     });

//     // Order details
//     doc.fontSize(12).text('Order Details:', { underline: true });
//     doc.moveDown();
//     doc.text(`Total Amount: ₹${orderData.totalAmount.toFixed(0)}`);
//     doc.text(`Payable Amount: ₹${orderData.payableAmount ? orderData.payableAmount.toFixed(0) : 'N/A'}`);
//     doc.text(`Order Status: ${orderData.orderStatus}`);
//     doc.text(`Payment Status: ${orderData.paymentStatus}`);
//     doc.text(`Payment Method: ${orderData.paymentMethod}`);
//     doc.moveDown();

//     // Address details
//     doc.fontSize(12).text('Address Details:', { underline: true });
//     doc.moveDown();
//     doc.text(`Name: ${orderData.address.name}`);
//     doc.text(`Address: ${orderData.address.address}`);
//     doc.text(`City: ${orderData.address.city}`);
//     doc.text(`State: ${orderData.address.state}`);
//     doc.text(`Pincode: ${orderData.address.pincode}`);

//     // End the document
//     doc.end();

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

module.exports.getInvoice = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ email: req.user });
    const userId = userData._id;

    const orderId = req.query.orderId;
    // const orderData = await orderCollection.findById(orderId);
    const orderData = await orderCollection
      .findById({ _id: orderId })
      .populate("products.productId");
    const addressId = orderData.address;
    const addressData = addressId.address;

    const productIds = orderData.products;
    const productsData = await productCollection.find({
      _id: { $in: productIds },
    });
    // console.log(productsData);
    res.render("user-invoice", { orderData, addressData, productsData });
  } catch (error) {
    console.error("Error:", error);
  }
};
