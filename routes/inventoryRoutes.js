const express = require("express");
const inventoryModel = require("../models/inventoryModel");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
  donorDonateController,
  getDonorsByCityController,
  getCertificateController,
  getLastDonationController,
  getMeUserController,
  updateUserController,
} = require("../controllers/inventoryController");

const router = express.Router();

//routes
// ADD INVENTORY || POST
router.post("/create-inventory", authMiddelware, createInventoryController);

//GET ALL BLOOD RECORDS
router.get("/get-inventory", authMiddelware, getInventoryController);


//GET RECENT BLOOD RECORDS
router.get(
  "/get-recent-inventory",
  authMiddelware,
  getRecentInventoryController
);

//GET HOSPITAL BLOOD RECORDS
router.post(
  "/get-inventory-hospital",
  authMiddelware,
  getInventoryHospitalController
);

//GET DONAR RECORDS
router.get("/get-donars", authMiddelware, getDonarsController);

//GET HOSPITAL RECORDS
router.get("/get-hospitals", authMiddelware, getHospitalController);

//GET orgnaisation RECORDS
router.get("/get-orgnaisation", authMiddelware, getOrgnaisationController);

//GET orgnaisation RECORDS
router.get(
  "/get-orgnaisation-for-hospital",
  authMiddelware,
  getOrgnaisationForHospitalController
);

// routes/inventoryRoutes.js
router.post("/donor-donate", authMiddelware, donorDonateController);


router.get('/get-donars-by-city', authMiddelware, getDonorsByCityController);

router.get("/certificate/:donationId", authMiddelware, getCertificateController);

router.get("/last-donation", authMiddelware, getLastDonationController);

router.get("/meUser", authMiddelware, getMeUserController);

// ✅ UPDATE user details
router.put("/update", authMiddelware, updateUserController);

// GET donor linked organisations
router.get("/linked-orgs", authMiddelware, async (req, res) => {
  try {
    const donar = req.user.id;
    const orgIds = await inventoryModel.distinct("organisation", { donar });
    const organisations = await userModel.find({
      _id: { $in: orgIds },
      role: "organisation",
    });

    res.status(200).send({
      success: true,
      organisations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching donor organisations" });
  }
});


module.exports = router;