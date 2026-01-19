const express = require('express');
const { signUp, signIn, verifyEmail } = require('../controllers/user');
const { auth } = require('../middleware');
const router = express.Router();

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/verifyEmail", verifyEmail);

module.exports = router;