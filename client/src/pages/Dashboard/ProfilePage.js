import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/API";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/inventory/meUser");
        if (data.success) setUser(data.user);
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <div className="card-body text-center">
          <h2 className="mb-4 text-primary">Welcome to Profile</h2>
          <p><strong>Name:</strong> {user.name || user.organisationName || user.hospitalName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>

          <div className="mt-4">
            <button
              className="btn btn-primary me-3"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
