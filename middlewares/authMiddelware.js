const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }


    const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        organisation: user.organisation,
        name: user.name,
      };

      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Auth error" });
  }
};

module.exports = authMiddleware;
