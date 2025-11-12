const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

// =============================
// CREATE INVENTORY
// =============================
const createInventoryController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ success: false, message: "User Not Found" });
    }

    const { inventoryType, bloodGroup, quantity, email } = req.body;

    // BASIC VALIDATION
    if (!inventoryType || !bloodGroup || !quantity || !email) {
      return res.status(400).send({ success: false, message: "All fields required" });
    }

    // =============================
    // OUT (blood given to hospital)
    // =============================
    if (inventoryType === "out") {
      const organisation = new mongoose.Types.ObjectId(req.user.id);

      // find total IN
      const totalInResult = await inventoryModel.aggregate([
        { $match: { organisation, inventoryType: "in", bloodGroup } },
        { $group: { _id: "$bloodGroup", total: { $sum: "$quantity" } } },
      ]);
      const totalIn = totalInResult[0]?.total || 0;

      // find total OUT
      const totalOutResult = await inventoryModel.aggregate([
        { $match: { organisation, inventoryType: "out", bloodGroup } },
        { $group: { _id: "$bloodGroup", total: { $sum: "$quantity" } } },
      ]);
      const totalOut = totalOutResult[0]?.total || 0;

      const available = totalIn - totalOut;

      if (available < quantity) {
        return res.status(400).send({
          success: false,
          message: `Only ${available}ML of ${bloodGroup} is available`,
        });
      }

      // validate hospital
      const hospital = await userModel.findOne({ email, role: "hospital" });
      if (!hospital) {
        return res.status(400).send({
          success: false,
          message: "Invalid hospital email. OUT request only for registered hospitals.",
        });
      }

      req.body.hospital = hospital._id;
    } else {
      // =============================
      // IN (donor donates blood)
      // =============================
      const donor = await userModel.findOne({ email, role: "donar" });
      if (!donor) {
        return res.status(400).json({
          success: false,
          message: "Donor not found. Please register first.",
        });
      }
      req.body.donar = donor._id;

      console.log("Saving inventory with:", req.body);

    }

    // always attach organisation

    // req.body.organisation = req.user.id;

    if (user.role === "donar" && req.body.organisation) {
       req.body.organisation = req.body.organisation;
     } else {
       req.body.organisation = req.user.id;
     }


    const inventory = new inventoryModel(req.body);
    await inventory.save();

    res.status(201).send({ success: true, message: "Record Added", data: inventory });
  } catch (error) {
    console.error("CreateInventoryController Error:", error);
    res.status(500).json({ success: false, message: "Error In Create Inventory API", error: error.message });
  }
};

const getInventoryController = async (req, res) => {
  try {
    const organisationId = req.user.id;

    const inventory = await inventoryModel
      .find({ organisation: organisationId })
      .populate("donar", "name email")
      .populate("hospital", "name email")
      .populate("organisation", "name email") 
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Get all records successfully",
      inventory,
    });
  } catch (error) {
    console.log("GetInventoryController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error In Get All Inventory",
      error: error.message,
    });
  }
};
// =============================
// GET INVENTORY FOR HOSPITAL
// =============================
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters || {})
      .populate("donar", "name email")
      .populate("hospital", "name email")
      .populate("organisation", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Get hospital consumer records successfully",
      inventory,
    });
  } catch (error) {
    console.log("GetInventoryHospitalController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error In Get consumer Inventory",
      error: error.message,
    });
  }
};
// =============================
// GET RECENT 3 INVENTORY RECORDS
// =============================
const getRecentInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({ organisation: req.user.id })
      .populate("donar", "name email")   // ✅ donor email laao
      .populate("hospital", "name email")
      .populate("organisation", "name email")
      .limit(50)
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Recent Inventory Data",
      inventory,
    });
  } catch (error) {
    console.log("GetRecentInventoryController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error In Recent Inventory API",
      error: error.message,
    });
  }
};
// =============================
// GET DONORS LIST FOR ORG
// =============================
const getDonarsController = async (req, res) => {
  try {
    // Get hospital user
    const hospitalUser = await userModel.findById(req.user.id);

    if (!hospitalUser) {
      return res.status(404).send({
        success: false,
        message: "Hospital user not found",
      });
    }

    const hospitalCity = hospitalUser.address?.toLowerCase();

    // Fetch donations
    const donations = await inventoryModel
      .find({
        inventoryType: "in",
        donar: { $ne: null },
      })
      .populate("donar", "name email phone address")
      .populate("organisation", "organisationName address phone email")
      .sort({ createdAt: -1 });

    // Filter by city and valid donor names
    const filteredDonations = donations.filter((d) => {
      const orgAddress = d.organisation?.address?.toLowerCase();
      const donorName = d.donar?.name?.toLowerCase();
      return (
        orgAddress === hospitalCity &&
        donorName &&
        donorName !== "na" &&
        donorName.trim() !== ""
      );
    });

    const donars = filteredDonations.map((d) => ({
      _id: d.donar._id,
      name: d.donar.name,
      email: d.donar.email,
      phone: d.donar.phone,
      bloodGroup: d.bloodGroup,
      quantity: d.quantity,
      address: d.donar.address,
      organisationName: d.organisation?.organisationName || "N/A",
      // organisationEmail: d.organisation?.email || "N/A",
      organisationPhone: d.organisation?.phone || "N/A",
      organisationAddress: d.organisation?.address || "N/A",
      date: d.createdAt,
    }));

    return res.status(200).send({
      success: true,
      message: "Donor records fetched for your city",
      donars,
    });
  } catch (error) {
    console.log("GetDonarsController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error in donor records",
      error: error.message,
    });
  }
};
// =============================
// GET HOSPITALS LIST FOR ORG
// =============================
const getHospitalController = async (req, res) => {
  try {
    const organisation = req.user.id;
    const hospitalIds = await inventoryModel.distinct("hospital", { organisation });
    const hospitals = await userModel.find({ _id: { $in: hospitalIds } });

    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log("GetHospitalController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error: error.message,
    });
  }
};
// =============================
// GET ORGS LINKED TO A DONOR
// =============================
const getOrgnaisationController = async (req, res) => {
  try {
    const donar = req.user.id;

    // Get unique organisation IDs
    const orgIds = await inventoryModel.distinct("organisation", { donar });

    // Fetch unique organisations
    const organisations = await userModel
      .find({ _id: { $in: orgIds }, role: "organisation" })
      .sort({ createdAt: -1 });

    // Optional: ensure uniqueness manually (if something weird happens)
    const uniqueOrgsMap = new Map();
    organisations.forEach(org => {
      if (!uniqueOrgsMap.has(org.organisationName)) {
        uniqueOrgsMap.set(org.organisationName, org);
      }
    });

    const uniqueOrganisations = Array.from(uniqueOrgsMap.values());

    return res.status(200).send({
      success: true,
      message: "Organisation Data Fetched Successfully",
      organisations: uniqueOrganisations,
    });
  } catch (error) {
    console.log("GetOrgnaisationController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error: error.message,
    });
  }
};
// =============================
// GET ORGS LINKED TO A HOSPITAL
// =============================
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.user.id;
    const orgIds = await inventoryModel.distinct("organisation", { hospital });
    const organisations = await userModel.find({ _id: { $in: orgIds }, role: "organisation" });

    return res.status(200).send({
      success: true,
      message: "Hospital Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log("GetOrgnaisationForHospitalController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital ORG API",
      error: error.message,
    });
  }
};

const donorDonateController = async (req, res) => {
  try {
    const { organisationId, bloodGroup, quantity } = req.body;

    if (!organisationId || !bloodGroup || !quantity) {
      return res.status(400).send({ success: false, message: "All fields are required" });
    }

    // Check organisation
    const organisation = await userModel.findOne({ _id: organisationId, role: "organisation" });
    if (!organisation) {
      return res.status(400).send({ success: false, message: "Invalid organisation" });
    }

    // Create inventory entry directly
    const inventory = await inventoryModel.create({
      inventoryType: "in",   // always IN when donor donates
      bloodGroup,
      quantity,
      organisation: organisationId,
      donar: req.user.id,    // donor is taken from token
    });

    return res.status(201).send({
      success: true,
      message: "Blood donated successfully",
      inventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error in donor donation", error: error.message });
  }
};

// controllers/inventoryController.js

const getDonorsByCityController = async (req, res) => {
  try {
    const hospitalUserId = req.user.id;

    // 1. Get hospital user with address (city)
    const hospital = await userModel.findById(hospitalUserId);
    if (!hospital) {
      return res.status(404).send({ success: false, message: "Hospital user not found" });
    }
    const city = hospital.address?.toLowerCase(); // ✅ FIXED (was city)

    // 2. Fetch inventory with donor + organisation populated
    const donations = await inventoryModel
      .find({ inventoryType: "in", donar: { $ne: null } })
      .populate("donar", "name email phone address")
      .populate("organisation", "name address")
      .sort({ createdAt: -1 });

    // 3. Strict filter → hospital.address === donor.address === organisation.address
    const filtered = donations.filter(
      (d) =>
        d?.donar?.address?.toLowerCase() === city &&
        d?.organisation?.address?.toLowerCase() === city
    );

    if (!filtered.length) {
      return res.status(200).send({
        success: true,
        message: "No donors found in your city",
        donars: [],
      });
    }

    // 4. Map response
    return res.status(200).send({
      success: true,
      message: "Donors fetched successfully",
      donars: filtered.map((d) => ({
        _id: d.donar._id,
        name: d.donar.name,
        email: d.donar.email,
        phone: d.donar.phone,
        bloodGroup: d.bloodGroup,
        quantity: d.quantity,
        address: d.donar?.city || d.donar?.address,
        organisation: d.organisation?.organisationName,
        date: d.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching donors by city:", error);
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// =============================
// GET CERTIFICATE BY DONATION ID
// =============================
const getCertificateController = async (req, res) => {
  try {
    const { donationId } = req.params;

    // 1. Find donation record
    const donation = await inventoryModel.findById(donationId)
      .populate("donar", "name email")
      .populate("organisation", "name email organisationName")
      .populate("hospital", "name email");

    if (!donation) {
      return res.status(404).send({ success: false, message: "Donation not found" });
    }

    // 2. Prepare certificate data
    const certificateData = {
      donorName: donation?.donar?.name,
      donorEmail: donation?.donar?.email,
      organisationName: donation?.organisation?.organisationName || donation?.organisation?.name,
      organisationEmail: donation?.organisation?.email,
      bloodType: donation?.bloodGroup,
      quantity: donation?.quantity,
      date: donation?.createdAt,
      message: "🎉 Congratulations! Thank you for your noble contribution.",
    };

    return res.status(200).send({
      success: true,
      message: "Certificate generated successfully",
      certificate: certificateData,
    });
  } catch (error) {
    console.error("GetCertificateController Error:", error);
    return res.status(500).send({
      success: false,
      message: "Error generating certificate",
      error: error.message,
    });
  }
};
// ✅ Get last donation for a donor
const getLastDonationController = async (req, res) => {
  try {
    const donarId = req.user.id;

    // Find last donation
    const lastDonation = await inventoryModel
      .findOne({ donar: donarId })
      .sort({ createdAt: -1 });

    if (!lastDonation) {
      return res.status(404).send({
        success: false,
        message: "No donation found for this donor",
      });
    }

    res.status(200).send({
      success: true,
      donationId: lastDonation._id,
    });
  } catch (error) {
    console.error("LastDonation Error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching last donation",
      error: error.message,
    });
  }
};
// ✅ GET personal details
const getMeUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching details" });
  }
};
// ✅ UPDATE personal details
const updateUserController = async (req, res) => {
  try {
    const { name, phone, address, website } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, website },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Error updating details" });
  }
};
module.exports = {
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
  updateUserController
};
