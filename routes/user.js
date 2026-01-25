const express = require('express');
const { signUp, signIn, verifyEmail, forgotPassword, resetPassword } = require('../controllers/user');
const { auth } = require('../middleware');
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/verifyEmail", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;