const express = require("express");
const { 
  createProduct, 
  searchProduct, 
  allProducts, 
  getProductById, 
  deleteProduct, 
  updateProduct, 
  deleteAllProducts 
} = require("../controllers/product");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "uploads/")
    },
    filename: function (req, file, cb){
        // Replace spaces with hyphens to avoid URL issues
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '-'))
    }
})

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }) 


router.post("/add", upload.array("images"), createProduct);

router.get("/search/:key", searchProduct);
router.get("/all", allProducts);

// Optional: If you want to allow updating images, you might need upload.array here too
router.patch("/update/:id", upload.array("images"), updateProduct);

router.get(`/getById/:id`, getProductById);
router.delete("/delete/:id", deleteProduct);
router.delete("/deleteAll", deleteAllProducts);

module.exports = router;