const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
//const {uploads} = require("../multer-middleware/multer_middleware")

const categoryCollection = require("../../models/category");
const productCollection = require("../../models/product");

// render product list page
module.exports.getProductList = async (req, res) => {
  try {
    const productdata = await productCollection.find();
    res.render("admin-productlist", { productdata });
  } catch (error) {
    console.error(error);
  }
};

// render add product page
module.exports.getAddProduct = async (req, res) => {
  try {
    const categorydata = await categoryCollection.find();
    const categories = Array.isArray(categorydata)
      ? categorydata
      : [categorydata];
    res.render("admin-addproduct", { categories });
  } catch (error) {
    console.error(error);
  }
};

// adding product
module.exports.postProduct = async (req, res) => {
  try {
    if (req.files) {
      const productImg = req.files;
      let arr = [];

      for (const element of productImg) {
        const filePath = `uploads/cropperd_${element.originalname}`;
        const cropped = await sharp(element.path)
          .resize({ width: 300, height: 300, fit: "cover" })
          .toFile(filePath);
        arr.push({ path: filePath });
        console.log(filePath);
      }

      const imageIds = arr.map((productImg) => productImg.path);
      console.log("IMAGE ID" + imageIds);

      await productCollection.create({
        productName: req.body.productName,
        productDiscription: req.body.productDiscription,
        productCategory: req.body.productCategory,
        productBrand: req.body.productBrand,
        regularPrice: req.body.regularPrice,
        sellingPrice: req.body.sellingPrice,
        productSize: req.body.productSize,
        productStock: req.body.productStock,
        productStatus: req.body.productStatus,
        productImg: imageIds,
      });

      const productdata = await productCollection.find();
      // res.render("admin-productlist", { productdata });
      res.redirect("/admin/product-list");
      console.log(imageIds);
    } else {
      res.status(400).send("No images selected for upload");
    }
  } catch (error) {
    console.error(error);
  }
};

// delete a product
module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(productId);
    const result = await productCollection.deleteOne({ _id: productId });
    if (result.deletedCount === 1) {
      res.redirect("/admin/product-list");
    } else {
      res.status(404).send("Category not found");
    }
  } catch (error) {
    console.error(error);
  }
};

// render product edit page
module.exports.editProduct = async (req, res) => {
  try {
    const product = req.params.productId;
    const productdata = await productCollection.findOne({ _id: product });
    const categorydata = await categoryCollection.find();
    res.render("admin-editproduct", { productdata, categorydata });
  } catch (error) {
    console.log(error);
  }
};

//saving edited details into the db
module.exports.updateProduct = async (req, res) => {
  try {
    const editId = req.params.productId;
    const existingProduct = await productCollection.findById(editId);

    const {
      productName,
      productDiscription,
      productCategory,
      productBrand,
      regularPrice,
      sellingPrice,
      productSize,
      productStock,
      productStatus,
    } = req.body;

    const newproductImg = req.files;
    const arr = [];

    // Existing images
    const existingImages = existingProduct.productImg;

    // Process new images with sharp and add to the array
    if (newproductImg) {
      for (const element of newproductImg) {
        const filePath = `uploads/cropperd_${element.originalname}`;
        const cropped = await sharp(element.path)
          .resize({ width: 300, height: 300, fit: "cover" })
          .toFile(filePath);
        arr.push(filePath);
      }
    }

    // Combine existing and new image paths
    const updatedProductImg = [...existingImages, ...arr];

    const updatedData = {
      productName,
      productDiscription,
      productCategory,
      productBrand,
      regularPrice,
      sellingPrice,
      productSize,
      productStock,
      productStatus,
      productImg: updatedProductImg,
    };

    const updatedProduct = await productCollection.findByIdAndUpdate(
      editId,
      updatedData,
      { new: true }
    );
    const successMessage = "Product updated successfully";
    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/edit-product", {
      error: "An error occurred while updating the product, please try again",
    });
  }
};

// block product
module.exports.blockProduct = async (req, res) => {
  try {
    Idproduct = req.params.productId;
    const newStatus = await productCollection.findById({ _id: Idproduct });
    const updatedStatus = await productCollection.updateOne(
      { _id: Idproduct },
      { $set: { productStatus: "Block" } }
    );
    res.redirect("/admin/product-list");
  } catch (error) {
    console.error(error);
  }
};

// Unblock product
module.exports.unblockProduct = async (req, res) => {
  try {
    Idproduct = req.params.productId;
    const newStatus = await productCollection.findById({ _id: Idproduct });
    const updatedStatus = await productCollection.updateOne(
      { _id: Idproduct },
      { $set: { productStatus: "Unblock" } }
    );
    res.redirect("/admin/product-list");
  } catch (error) {
    console.error(error);
  }
};

// delete image
module.exports.deleteImage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const imagepath = req.query.image;

    console.log("Deleting Image:", imagepath);

    // Update the document to pull the image
    await productCollection.updateOne(
      { _id: productId },
      { $pull: { productImg: imagepath } }
    );

    // Render the view with the updated product data
    const productdata = await productCollection.findOne({ _id: productId });
    const categorydata = await categoryCollection.find({});
    res.render("admin-editproduct", { productdata, categorydata });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
