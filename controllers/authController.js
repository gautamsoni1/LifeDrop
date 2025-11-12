const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");



const registerController = async (req, res) => {

try {
    const { role,name,organisationName,hospitalName,email,password,website,address,phone} = req.body;

    // ----------- BASIC FIELD VALIDATION -----------
    if (!role || !email || !password || !address || !phone) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Role-specific required fields
    if ((role === "user" || role === "admin") && !name) {
      return res.status(400).json({ message: "Name is required for user/admin" });
    }
    if (role === "organisation" && !organisationName) {
      return res.status(400).json({ message: "Organisation name is required" });
    }
    if (role === "hospital" && !hospitalName) {
      return res.status(400).json({ message: "Hospital name is required" });
    }

    // ----------- REGEX VALIDATION -----------
    const namePattern = /^[A-Za-z][A-Za-z\s]+$/;
    const emailPattern = /^[A-Za-z]{2}[\w.+-]*@[A-Za-z]+(?:\.[A-Za-z]+)*\.com$/;
    const phonePattern = /^\d{10}$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[\W_])(?=.*\d).+$/;

    if ((role === "user" || role === "admin") && !namePattern.test(name)) {
      return res.status(400).json({ message: "Name must contain only letters and start with a letter" });
    }
    if (role === "organisation" && !namePattern.test(organisationName)) {
      return res.status(400).json({ message: "Organisation name must contain only letters" });
    }
    if (role === "hospital" && !namePattern.test(hospitalName)) {
      return res.status(400).json({ message: "Hospital name must contain only letters" });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (!phonePattern.test(phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }
    if (!passwordPattern.test(password)) {
      return res.status(400).json({ message: "Password must contain uppercase, special character, and number" });
    }

    // ----------- DUPLICATE CHECKS -----------
    const emailExists = await userModel.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: "This email already exists" });
    }
    const phoneExists = await userModel.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "This phone number already exists" });
    }

    // ----------- PASSWORD HASHING -----------
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ----------- CREATE USER -----------
    const user = new userModel({ role, name, organisationName, hospitalName, email: email.toLowerCase(), password: hashedPassword, website, address, phone });
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      user: userResponse
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error In Register API",
      error: error.message
    });
  }
};

//login call back
const loginController = async (req, res) => {
 try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // console.log("Login attempt:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", { email, password, userInDB: user });


    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Error In Login API",
      error: err.message,
    });
  }

};

// //GET CURRENT USER
const currentUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    return res.status(200).send({
      success: true,
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "unable to get current user",
      error,
    });
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide email" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please register." , user});
    }

    // Use the same JWT secret as login
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Hi ${user.name || "User"},</p>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Password reset link sent successfully to your email." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
//Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide a new password" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


const getAllOrganisationsController = async (req, res) => {
  try {
    const orgData = await userModel.find({ role: "organisation" }).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      total: orgData.length,
      message: "Organisation list fetched successfully",
      organisations: orgData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching organisations",
      error,
    });
  }
};


module.exports = { registerController , loginController , currentUserController ,forgotPassword , resetPassword, getAllOrganisationsController };