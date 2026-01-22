const express = require("express");
const { createProduct, searchProduct, allProducts, getProductById, deleteProduct, updateProduct, deleteAllProducts } = require("../controllers/product");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "uploads/")
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }) 
router.get("/fix-search-index", async (req, res) => {
  try {
    // 1. Drop existing indexes (to clear conflicts)
    await Product.collection.dropIndexes();
    
    // 2. Force create the new Text Index
    await Product.collection.createIndex({ name: 'text', description: 'text' }, { weights: { name: 10, description: 5 } });
    
    res.send("✅ Success! Search Index has been rebuilt.");
  } catch (error) {
    res.status(500).send("❌ Error rebuilding index: " + error.message);
  }
});
router.post("/add",upload.single("image"), createProduct);
router.get("/search/:key", searchProduct);
router.get("/all", allProducts);
router.patch("/update/:id", updateProduct);
router.get(`/getById/:id`, getProductById);
router.delete("/delete/:id", deleteProduct);
router.delete("/deleteAll", deleteAllProducts);

module.exports = router;