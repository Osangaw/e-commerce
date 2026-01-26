const express = require("express");
const { addAddress, getAddresses, updateAddress, deleteAddress, getAddressById } = require("../controllers/address");
const { auth } = require("../middleware");
const router = express.Router();


router.patch("/edit", auth, updateAddress)
router.post("/add",auth, addAddress)
router.get("/get",auth, getAddresses)
router.get("/:id",auth, getAddressById)
router.delete("/delete",auth, deleteAddress)


module.exports = router;