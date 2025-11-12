import React, { useEffect, useState ,useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import Layout from "../components/shared/Layout/Layout";
import Modal from "../components/shared/modal/Modal";
import API from "../services/API";
import moment from "moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const HomePage = () => {
  const { loading, error, user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [showCert, setShowCert] = useState(false);
  const navigate = useNavigate();
  const certRef = useRef(null);

  // ✅ Fetch inventory
  const getBloodRecords = useCallback(async () => {
    try {
      const { data } = await API.get("/inventory/get-inventory");
      if (data?.success) {
        setData(data.inventory);
      }
    } catch (err) {
      console.log("Fetch inventory error:", err.response?.data || err.message);
    }
  }, []);

  // ✅ Fetch certificate
  const getCertificate = async (donationId) => {
    try {
      const { data } = await API.get(`/inventory/certificate/${donationId}`);
      if (data?.success) {
        setCertificate(data.certificate);
        setShowCert(true);
      }
    } catch (err) {
      console.log("Fetch certificate error:", err.response?.data || err.message);
    }
  };

  // ✅ Auto-download PDF
  useEffect(() => {
    if (showCert && certificate && certRef.current) {
      const timer = setTimeout(() => {
        html2canvas(certRef.current, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("landscape", "mm", "a4");
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
          pdf.save("Blood-Donation-Certificate.pdf");
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCert, certificate]);

  // ✅ Role-based logic
  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin");
    }

    if (user.role === "hospital" || user.role === "organisation") {
      getBloodRecords();
    }

    if (user.role === "donar") {
      API.get("/inventory/last-donation").then((res) => {
        if (res.data.success && res.data.donationId) {
          getCertificate(res.data.donationId);
        }
      });
    }
  }, [user, navigate, getBloodRecords]);

  if (loading) return <Spinner />;

  return (
    <Layout>
      {error && <span>{alert(error)}</span>}

      <div className="container">
        {/* ✅ Donor View */}
        {user?.role === "donar" && (
          <div className="text-center mt-5">
            <h2>Welcome to LifeDrop</h2>
            <p className="lead">One step to save another life ❤️</p>
          </div>
        )}

        {/* ✅ Hospital & Organisation View */}
        {(user?.role === "hospital" || user?.role === "organisation") && (
          <>
            <h4
              className="ms-4"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
              style={{ cursor: "pointer" }}
            >
              <i className="fa-solid fa-plus text-success py-4"></i>
              Add Inventory
            </h4>

            {/* Inventory Table */}
            <table className="table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Inventory Type</th>
                  <th>Quantity</th>
                  <th>Donor Email</th>
                  <th>Time & Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((record) => (
                  <tr key={record._id}>
                    <td>{record.bloodGroup}</td>
                    <td>{record.inventoryType}</td>
                    <td>{record.quantity} (ML)</td>
                    <td>{record.email}</td>
                    <td>
                      {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Inventory Modal */}
            <Modal />
          </>
        )}
      </div>

      {/* ✅ Certificate Modal (Donor + Organisation) */}
      {showCert && certificate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            ref={certRef}
            style={{
              background: "#fffdf5",
              border: "10px double #a4161a",
              padding: "50px",
              width: "90%",
              maxWidth: "1000px",
              fontFamily: "'Dancing Script', cursive",
              textAlign: "center",
              boxShadow: "0 0 25px rgba(0, 0, 0, 0.3)",
              position: "relative",
              borderRadius: "20px",
            }}
          >
            {/* Google Font */}
            <link
              href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap"
              rel="stylesheet"
            />

            {/* ❌ Close Button */}
            <button
              onClick={() => setShowCert(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "transparent",
                border: "none",
                fontSize: "1.8rem",
                color: "#d00000",
                cursor: "pointer",
              }}
              title="Close"
            >
              ❌
            </button>

            <h1 style={{ color: "#a4161a", fontSize: "3.2rem", marginBottom: "10px" }}>
              💉 Certificate of Appreciation
            </h1>

            <h3 style={{ color: "#1d3557", fontSize: "2rem", marginBottom: "40px" }}>
              {certificate.organisationName || "LifeDrop Blood Center"}
            </h3>

            <p style={{ fontSize: "1.5rem", color: "#333" }}>This is proudly presented to</p>

            <h2 style={{ fontSize: "2.8rem", color: "#7b2cbf", margin: "10px 0" }}>
              {certificate.donorName || "____________________"}
            </h2>

            <p style={{ fontSize: "1.4rem", color: "#222", marginBottom: "20px" }}>
              in recognition of their generous blood donation of{" "}
              <strong style={{ color: "#e63946" }}>{certificate.quantity}ml</strong> of{" "}
              <strong>{certificate.bloodType}</strong> on{" "}
              {moment(certificate.date).format("MMMM D, YYYY")}.
            </p>

            <p style={{ fontSize: "1.2rem", color: "#555" }}>
              Your kindness has made a difference and given hope to someone in need. ❤️
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};
export default HomePage;

