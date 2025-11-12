import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { useSelector } from "react-redux";

const Hospitals = () => {
  const { user } = useSelector((state) => state.auth);
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);

  // ✅ Fetch hospitals
  useEffect(() => {
    const getHospitals = async () => {
      try {
        const res = await API.get("/inventory/get-hospitals");
        if (res.data?.success) {
          setHospitals(res.data.hospitals);
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };
    getHospitals();
  }, []);

  // ✅ Fetch donors in same city as logged-in hospital
  useEffect(() => {
    const fetchDonorsInSameCity = async () => {
      try {
        const res = await API.get("/inventory/get-donars-by-city");
        if (res.data?.success) {
          setDonors(res.data.donars);
        }
      } catch (error) {
        console.error("Error fetching donors:", error);
      }
    };

    if (user?.role === "hospital") {
      fetchDonorsInSameCity();
    }
  }, [user]);

  return (
    <Layout>
      <h2 className="mb-3">Hospitals</h2>

      {/* ✅ Hospitals Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map((hosp) => (
            <tr key={hosp._id}>
              <td>{hosp.hospitalName || hosp.name}</td>
              <td>{hosp.email}</td>
              <td>{hosp.phone}</td>
              <td>{hosp.address}</td>
              <td>{moment(hosp.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* ✅ Donors in same city - show only if available */}
      {donors.length > 0 && (
        <>
          <h2 className="mb-3">Donors in Your City</h2>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th>
                <th>City / Place</th><th>Blood Group</th><th>Quantity (ml)</th>
                <th>Organisation</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor, index) => (
                <tr key={`${donor._id}-${index}`}>
                  <td>{donor.name}</td>
                  <td>{donor.email}</td>
                  <td>{donor.phone}</td>
                  <td>{donor.address}</td>
                  <td>{donor.bloodGroup}</td>
                  <td>{donor.quantity}</td>
                  <td>{donor.organisation}</td>
                  <td>{moment(donor.date).format("DD/MM/YYYY hh:mm A")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Layout>
  );
};

export default Hospitals;
