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

router.post("/add",upload.single("image"), createProduct);
router.get("/search/:name", searchProduct);
router.get("/all", allProducts);
router.patch("/update/:id", updateProduct);
router.get("/getById/:id", getProductById);
router.delete("/delete/:id", deleteProduct);
router.delete("/deleteAll", deleteAllProducts);

module.exports = router;