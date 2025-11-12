const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");
//GET BLOOD DATA

const bloodGroupDetailsContoller = async (req, res) => {
  try {
    const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
    const bloodGroupData = [];

    const userId = req.user.id;
    const isHospital = req.user.role === 'hospital';

    await Promise.all(
      bloodGroups.map(async (bloodGroup) => {

        let matchIn = {
          bloodGroup,
          inventoryType: isHospital ? "out" : "in",   // or ignore “in” for hospital
        };
        let matchOut = {
          bloodGroup,
          inventoryType: isHospital ? "out" : "out",  // hospital uses “out”
        };

        // Also filter by hospital or organisation:
        if (isHospital) {
          // inventory docs must have hospital field
          matchIn.hospital = userId;  
          matchOut.hospital = userId;
        } else {
          matchIn.organisation = userId;
          matchOut.organisation = userId;
        }

        // totalIn is maybe irrelevant for hospital, but still compute for consistency
        const totalInAgg = await inventoryModel.aggregate([
          { $match: matchIn },
          { $group: { _id: null, total: { $sum: "$quantity" } } }
        ]);

        const totalOutAgg = await inventoryModel.aggregate([
          { $match: matchOut },
          { $group: { _id: null, total: { $sum: "$quantity" } } }
        ]);

        const recEntriesQuery = {
          bloodGroup,
          inventoryType: "out",
        };
        if (isHospital) {
          recEntriesQuery.hospital = userId;
        } else {
          recEntriesQuery.organisation = userId;
        }
        const recentEntries = await inventoryModel
          .find(recEntriesQuery)
          .sort({ createdAt: -1 })
          .limit(3);

        const totalIn = (totalInAgg[0]?.total || 0);
        const totalOut = (totalOutAgg[0]?.total || 0);

        bloodGroupData.push({
          bloodGroup,
          totalIn: isHospital ? 0 : totalIn,           // maybe 0 for hospital
          totalOut,
          availabeBlood: isHospital ? 0 : (totalIn - totalOut), // for hospital maybe not relevant
          recentEntries,
        });
      })
    );

    return res.status(200).json({
      success: true,
      bloodGroupData,
    });
  } catch (error) {
    console.error("Error in bloodGroupDetailsController:", error);
    return res.status(500).json({ success: false, message: "Error in analytics", error });
  }
};

module.exports = { bloodGroupDetailsContoller };