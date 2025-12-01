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
    function randomNumber() {
      return Math.floor(100000 + Math.random() * 900000);
    }

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

    await newUser.save();
    console.log("user data:", newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    console.log("Error while signing up", e);
  }
};


exports.signIn = async (req, res) => {
  try {
    // const { email, userPassword } = req.body;
    const { email, password } = req.body;
    console.log("email", email);
    console.log("password", password);
    const user = await User.findOne({ email: email });
    console.log('user info',user);
    
const token = generateToken(user);
    if (!user) {
      return res
        .status(400)
        .json({ message: `User with ${email} does not exist` });
    }
    console.log("user..........................", user);
        console.log("Token", token);


    // const ValidPassword = await User.authenticate(userPassword)
    // if (!ValidPassword) {
    //     return res.status(400).json({message: 'password is incorrect'})
    // }
    const result = await bcrypt.compare(password, user.password);
      if (result) {
        console.log("user sign in successful", { user });
        return res
          .status(200)
          .json({ message: "user was able to sign in successfully", user: user ,token:token});
      }
    
  } catch (err) {
    console.log("unable to sign in ", err);
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