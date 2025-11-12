import React, { useState, useEffect } from "react";
import Header from "../../components/shared/Layout/Header";
import API from "./../../services/API";
import moment from "moment";
import "./Analytics.css"; 

const Analytics = () => {
  const [bloodData, setBloodData] = useState([]);
  const [recentInventory, setRecentInventory] = useState([]);
  const [allInventory, setAllInventory] = useState([]);

  // Fetch blood group stats
  const getBloodGroupData = async () => {
    try {
      const response = await API.get("/analytics/bloodGroups-data");
      if (response.data?.success) {
        setBloodData(response.data.bloodGroupData);
      }
    } catch (error) {
      console.error("Error fetching blood group data:", error);
    }
  };

  // Fetch recent inventory entries (for cards)
  const getRecentInventory = async () => {
    try {
      const response = await API.get("/inventory/get-recent-inventory");
      if (response.data?.success) {
        setRecentInventory(response.data.inventory);
      }
    } catch (error) {
      console.error("Error fetching recent inventory:", error);
    }
  };

  // Fetch all inventory entries (for table and calculations)
  const getAllInventory = async () => {
    try {
      const response = await API.get("/inventory/get-inventory");
      if (response.data?.success) {
        setAllInventory(response.data.inventory);
      }
    } catch (error) {
      console.error("Error fetching all inventory:", error);
    }
  };

  useEffect(() => {
    getBloodGroupData();
    getRecentInventory();
    getAllInventory();
  }, []);

  return (
    <>
      <Header />

      {/* Blood Group Cards */}
      <div
        className="cards-container"
        style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
      >
        {bloodData?.map((record, i) => {
          // Calculate totals dynamically based on allInventory
          const totalIn = allInventory
            .filter(
              (item) =>
                item.bloodGroup === record.bloodGroup &&
                item.inventoryType === "in"
            )
            .reduce((acc, curr) => acc + curr.quantity, 0);

          const totalOut = allInventory
            .filter(
              (item) =>
                item.bloodGroup === record.bloodGroup &&
                item.inventoryType === "out"
            )
            .reduce((acc, curr) => acc + curr.quantity, 0);

          const totalAvailable = totalIn - totalOut;

          // Filter recent entries by blood group
          const groupEntries = recentInventory?.filter(
            (inv) => inv.bloodGroup === record.bloodGroup
          );

          return (
            <div
              key={i}
              className="blood-card shadow"
              style={{
                flex: "1 1 18rem",
                borderRadius: "12px",
                background: `linear-gradient(135deg, #ff5f6d, #ffc371)`,
                color: "#fff",
                padding: "1rem",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h2 className="blood-title" style={{ textAlign: "center" }}>
                {record.bloodGroup}
              </h2>
              <p>
                Total In: <b>{totalIn}</b> (ML)
              </p>
              <p>
                Total Out: <b>{totalOut}</b> (ML)
              </p>
              <p>
                Total Available: <b>{totalAvailable}</b> (ML)
              </p>

              {groupEntries.length > 0 ? (
                <div
                  className="entries-box"
                  style={{
                    marginTop: "1rem",
                    background: "rgba(255,255,255,0.15)",
                    padding: "0.5rem",
                    borderRadius: "8px",
                  }}
                >
                  <h6 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                    Recent Entries
                  </h6>
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      margin: 0,
                      fontSize: "0.9rem",
                    }}
                  >
                    {groupEntries.map((entry) => (
                      <li
                        key={entry._id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.3)",
                          padding: "0.25rem 0",
                        }}
                      >
                        {entry.inventoryType} - {entry.quantity}ml
                        <br />
                        <small>
                          Donor: {entry.donar?.email || "N/A"} | Receiver:{" "}
                          {entry.hospital?.email ||
                            entry.organisation?.email ||
                            entry.receiver?.email || // additional fallback
                            "N/A"}{" "}
                          | {moment(entry.createdAt).format("DD/MM hh:mm A")}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ textAlign: "center", marginTop: "1rem" }}>
                  No Records
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* All Transactions Table */}
      <div className="container my-4">
        <h1 className="my-3 text-center">All Blood Transactions</h1>
        <div className="table-responsive shadow rounded">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Blood Group</th>
                <th>Inventory Type</th>
                <th>Quantity</th>
                <th>Donor Email</th>
                <th>Receiver Email</th>
                <th>Time & Date</th>
              </tr>
            </thead>
            <tbody>
              {allInventory?.map((record) => {
                const receiverEmail =
                  record.hospital?.email ||
                  record.organisation?.email || "N/A";
                
                const donarEmail = 
                  record.donar?.email ||
                  // record.hospital?.email ||
                  record.organisation?.email || "N/A";

                return (
                  <tr key={record._id}>
                    <td>{record.bloodGroup}</td>
                    <td>{record.inventoryType}</td>
                    <td>{record.quantity} (ML)</td>
                    <td>{donarEmail}</td>
                    <td>{receiverEmail}</td>
                    <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Analytics;
