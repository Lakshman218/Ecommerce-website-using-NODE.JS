const mongoose = require("mongoose");
const multer = require("multer");
//const {uploads} = require("../multer-middleware/multer_middleware")

const categoryCollection = require("../../models/category");
const productCollection = require("../../models/product");


// render category page with data
module.exports.getCategory = async (req, res) => {
  try {
      const categories = await categoryCollection.find();
      res.render("admin-categorylist", { categories });
  } catch (error) {
      console.error(error);
  }
};


// adding catagory data
module.exports.postCategory = async (req, res) => {
  try {
    const catgName = req.body.catgName;
    const categorydata = await categoryCollection.findOne({ catgName: catgName });
    if (categorydata) {
      res.status(409).json({ success: false, message: 'Category already exists' });
    } else {
      await categoryCollection.create({
        catgName: catgName,
        catgDiscription: req.body.catgDiscription,
        categoryStatus: "Unblock",
      });
      const categories = await categoryCollection.find();
      res.status(200).json({ success: true, message: 'Category added successfully', categories });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// render edit category data page
module.exports.editCategory = async (req,res) => {
  const category=req.params.categoryId
  const categorydata = await categoryCollection.findById({_id:category})
  res.render("admin-editcategory",{categorydata})
}

// update category
module.exports.updateCategory = async (req, res) => {
  try {
    const catgName = req.body.catgName;
    const catgDiscription = req.body.catgDiscription;
    const categoryId = req.body.categoryId;

    const category = await categoryCollection.findById(categoryId);

    if (catgName !== category.catgName) {
      const existingCategory = await categoryCollection.findOne({ catgName: catgName });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category already exists' });
      }
    }
    
    category.catgName = catgName;
    category.catgDiscription = catgDiscription;

    await category.save();

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// delete category
module.exports.deleteCategory = async(req,res) => {
  try {
    const catagoryId = req.params.categoryId;
    console.log(catagoryId)
    const result = await categoryCollection.deleteOne({_id:catagoryId});

    if(result.deletedCount === 1) {
      res.redirect("/admin/category-list")
    } else {
      res.status(404).send("Category not found")
    }
  } catch (error) {
    console.error(error);
  }
}


// block category
  // module.exports.blockCategory = async (req,res) => {
  //   try {
  //     Idcategory = req.params.categoryId
  //     console.log(Idcategory)
  //     const newStatus = await categoryCollection.findById({_id: Idcategory})
  //     const updatedStatus = await categoryCollection.updateOne({_id: Idcategory}, {$set: {categoryStatus: "Block"}})
  //     res.redirect('/admin/category-list')
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }
  module.exports.blockCategory = async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const categorydata = await categoryCollection.findById(categoryId)
      const categoryName = categorydata.catgName
      
      const categoryStatus = await categoryCollection.findById(categoryId).select('categoryStatus');
      
      await categoryCollection.findByIdAndUpdate(categoryId, { categoryStatus: 'Block' });
      await productCollection.updateMany({ productCategory: categoryName }, { $set: { productStatus: 'Block' } });
  
      res.redirect('/admin/category-list');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };


// unblock category
module.exports.unblockCategory = async (req,res) => {
  try {
    const categoryId = req.params.categoryId;
      const categorydata = await categoryCollection.findById(categoryId)
      const categoryName = categorydata.catgName
      
      const categoryStatus = await categoryCollection.findById(categoryId).select('categoryStatus');
      
      await categoryCollection.findByIdAndUpdate(categoryId, { categoryStatus: 'Unblock' });
      await productCollection.updateMany({ productCategory: categoryName }, { $set: { productStatus: 'Unblock' } });
  
      res.redirect('/admin/category-list');
  } catch (error) {
    console.error(error)
  }
}