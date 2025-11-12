import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";

const Donar = () => {
  const [data, setData] = useState([]);
  const [searchGroup, setSearchGroup] = useState(""); // blood group search state

  // Fetch donor records
  const getDonars = async () => {
    try {
      const { data } = await API.get("/inventory/get-donars", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (data?.success) {
        setData(data?.donars);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDonars();
  }, []);

  // ✅ Only exact match donors
 const filteredData =
  searchGroup === ""
    ? []
    : Array.from(
        new Map(
          data
            .filter(
              (record) =>
                record.bloodGroup &&
                record.bloodGroup.trim().toLowerCase() ===
                  searchGroup.trim().toLowerCase()
            )
            .map((record) => [record.email, record]) // deduplicate by email
        ).values()
      );

  return (
    <Layout>
      <div className="container">
        <h2 className="my-4">Search Donors by Blood Group</h2>

        {/* 🔍 Blood group selector */}
        <select
          className="form-control mb-3"
          value={searchGroup}
          onChange={(e) => setSearchGroup(e.target.value)}
        >
          <option value="">-- Select Blood Group --</option>
          <option value="a+">A+</option>
          <option value="a-">A-</option>
          <option value="b+">B+</option>
          <option value="b-">B-</option>
          <option value="ab+">AB+</option>
          <option value="ab-">AB-</option>
          <option value="o+">O+</option>
          <option value="o-">O-</option>
        </select>

        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Blood Group</th>
              <th>Quantity (ML)</th>
              <th>Donor Address</th>
              <th>Organisation Name</th>
              <th>Organisation Address</th>
              <th>Organisation Contact</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {searchGroup === "" ? (
              <tr>
                <td colSpan="10" className="text-center">
                  Please select a blood group to view donors.
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((record) => (
                <tr key={record._id}>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.phone}</td>
                  <td>{record.bloodGroup}</td>
                  <td>{record.quantity}</td>
                  <td>{record.address}</td>
                  <td>{record.organisationName}</td>
                  <td>{record.organisationAddress}</td>
                  <td>{record.organisationPhone}</td>
                  <td>{moment(record.date).format("DD/MM/YYYY hh:mm A")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No donors found for {searchGroup.toUpperCase()} blood group.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
export default Donar;
