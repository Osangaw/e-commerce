const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Token = require("../models/token");
const sendEmail = require("../util/mailService");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },   
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
function randomNumber() {
      return Math.floor(100000 + Math.random() * 900000);
    }

exports.signUp = async (req, res) => {
    console.log("Received body:", req.body);
  try {
    const { name, email, phoneNumber, password } = req.body;
    console.log("req.body:", req.body);
    if (!name || !email || !phoneNumber || !password) {
            console.log("validation error");
      return res.status(400).json({ message: "All fields are required" });
      
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `User already exists with email ${email}` });
    }
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phoneNumber,
      password: encryptedPassword,
     // role
    });
    try {
      const otp = randomNumber();
      const token = new Token({ email, token: otp });
      await sendEmail(email, otp);
      await token.save();
      console.log("email sent", otp);
    } catch (err) {
      console.log("error in sending mail", err);
    }
console.log('password:', encryptedPassword);

    await newUser.save();
    console.log("user data:", newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    console.log("Error while signing up", e);
  }
};


exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email", email);

    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(400).json({ message: `User with ${email} does not exist` });
    }

    const result = await bcrypt.compare(password, user.password);
    console.log('password check result:', result); // This is printing 'false' right now
    
    if (result) {
        const token = generateToken(user);
        return res.status(200).json({ 
            message: "user was able to sign in successfully", 
            user: user, 
            token: token
        });
    } else {
        // ✅ CRITICAL FIX: You were missing this part!
        // If password is wrong, tell the frontend!
        return res.status(400).json({ message: "Invalid Password" });
    }
    
  } catch (err) {
    console.log("unable to sign in ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, verifyToken } = req.body;
  try {
    const user = await Token.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: `User with ${email} does not exist` });
    }
    const tokenCheck = user.token === verifyToken;
    if (tokenCheck) {
      console.log("email verified successfully");
      const userr = await User.findOne({ email });
      userr.isVerified = true;
      const deleteToken = await Token.findOneAndDelete({ email });
      await userr.save();
      return res.status(200).json({ message: "email verified successfully" });
    } else {
      console.log("token verification failed");
      return res.status(400).json({ message: "email verification failed" });
    }
  } catch (err) {
    console.log("error in email verification", err);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.forgotPassword = async (req, res) => {
    // 1. Get Email
    const { email } = req.body; 

    // 2. Generate the Token HERE
    const otp = randomNumber(); 

    // 3. Save it to DB so we remember it for Step 2
    await Token.deleteMany({ email }); // Delete old ones
    const newToken = new Token({ email, token: otp });
    await newToken.save();

    // 4. Send the Email
    await sendEmail(email, otp);

    res.status(200).json({ message: "OTP sent" });
};

exports.resetPassword = async (req, res) => {
    // 1. Get ALL data: Email (to find user), OTP (to verify), New Password
    const { email, otp, newPassword } = req.body;

    // 2. Retrieve the "Memory" from Step 1
    const validToken = await Token.findOne({ email });

    // 3. Validate: Did they provide the token we saved in Step 1?
    if (!validToken || validToken.token !== otp.toString()) {
        return res.status(400).json({ message: "Wrong OTP" });
    }

    // 4. If correct, allow the Password Change
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.findOneAndUpdate(
        { email }, 
        { password: encryptedPassword }
    );

    // 5. Delete Token (Process complete)
    await Token.findOneAndDelete({ email });

    res.status(200).json({ message: "Password Changed" });
};