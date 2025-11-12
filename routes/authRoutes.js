const express = require("express");
const {
  registerController,
  loginController,
  currentUserController,
  forgotPassword,
  resetPassword,
  getAllOrganisationsController,
} = require("../controllers/authController");
const authMiddelware = require("../middlewares/authMiddelware");

const router = express.Router();

//routes
//REGISTER || POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Current User || GET
router.get("/current-user", authMiddelware, currentUserController);


//Forgot-Password
router.post("/forgot-password", forgotPassword);

//Reset password
router.post("/reset-password/:token", resetPassword);

router.get("/organisations", authMiddelware, getAllOrganisationsController);

module.exports = router;