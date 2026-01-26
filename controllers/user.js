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
  try {
    const { name, email, phoneNumber, password, role } = req.body;
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
      role,
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
    try {
        const { email } = req.body; 

        // ✅ SAFETY CHECK: Does the user exist?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }
        // 2. Generate the Token
        const otp = randomNumber(); 
        console.log('t;', otp);
        

        // 3. Save it to DB (Delete old tokens first to prevent duplicates)
        await Token.deleteMany({ email }); 
        const newToken = new Token({ email, token: otp });
        await newToken.save();

        // 4. Send the Email with the correct Subject
        // ✅ UPDATED: Added "Password Reset Request" so the user gets the right email layout
        await sendEmail(email, otp, "Password Reset Request");

        return res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.log("Forgot Password Error:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // 1. Get ALL data
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Retrieve the Token from DB
        const validToken = await Token.findOne({ email });

        // 3. Validate: Does token exist? Does it match?
        if (!validToken || validToken.token !== otp.toString()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // 4. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(newPassword, salt);
        
        // 5. Update the User
        const user = await User.findOneAndUpdate(
            { email }, 
            { password: encryptedPassword }
        );

        if (!user) {
             return res.status(404).json({ message: "User not found" });
        }

        // 6. Delete Token (Cleanup)
        await Token.findOneAndDelete({ email });

        return res.status(200).json({ message: "Password Changed Successfully" });

    } catch (error) {
        console.log("Reset Password Error:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
};