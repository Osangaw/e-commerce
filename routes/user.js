const express = require('express');
const { signUp, signIn, verifyEmail } = require('../controllers/user');
const { auth } = require('../middleware');
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/verifyEmail", verifyEmail);

module.exports = router;