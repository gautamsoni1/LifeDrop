const userModel = require("../models/userModel");

module.exports = (req, res, next) => {
  try {
    // ✅ check if req.user exists
    if (!req.user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // ✅ check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Auth Failed: Admin access required",
      });
    }

    // ✅ proceed if admin
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error in admin middleware",
      error,
    });
  }
};
