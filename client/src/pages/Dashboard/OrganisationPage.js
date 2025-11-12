import React, { useEffect, useState ,useCallback } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import API from "../../services/API";
import Modal from "../../components/shared/modal/Modal";

const OrganisationPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [search, setSearch] = useState(""); // 🔍 state for search input

  const getOrg = useCallback(async () => {
    try {
      let roleBasedResponse;
      let authOrgsResponse;

      // Get role-based organisations
      if (user?.role === "donar") {
        roleBasedResponse = await API.get("/inventory/get-orgnaisation");
      } else if (user?.role === "hospital") {
        roleBasedResponse = await API.get("/inventory/get-orgnaisation-for-hospital");
      }

      // Get all registered organisations
      authOrgsResponse = await API.get("/auth/organisations");

      const roleBasedData = roleBasedResponse?.data?.success
        ? roleBasedResponse.data.organisations
        : [];
      const authOrgsData = authOrgsResponse?.data?.success
        ? authOrgsResponse.data.organisations
        : [];

      // ✅ Deduplicate based on email
      const uniqueMap = new Map();
      [...roleBasedData, ...authOrgsData].forEach((org) => {
        if (!uniqueMap.has(org.email)) {
          uniqueMap.set(org.email, org);
        }
      });

      setData(Array.from(uniqueMap.values()));
    } catch (error) {
      console.log("Error fetching organisations:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) getOrg();
  }, [user, getOrg]);

  // 🔍 Filter organisations by name
  const filteredData = data.filter((org) =>
    (org.organisationName || org.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h2 className="mb-3">Organisations</h2>

      {/* 🔍 Search input */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search organisation by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>Organisation Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((record) => (
              <tr key={record._id}>
                <td>{record.organisationName || record.name}</td>
                <td>{record.email}</td>
                <td>{record.phone}</td>
                <td>{record.address}</td>
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop"
                    onClick={() => setSelectedOrg(record)}
                  >
                    Add Blood
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No organisations found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for Add Blood */}
      <Modal selectedOrg={selectedOrg} />
    </Layout>
  );
};
export default OrganisationPage;
