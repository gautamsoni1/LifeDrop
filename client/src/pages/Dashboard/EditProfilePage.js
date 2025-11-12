import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/API";

const EditProfilePage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: ""
  });
  const navigate = useNavigate();

  // Load user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/inventory/meUser");
        if (data.success) {
          setForm({
            name:
              data.user.name ||
              data.user.hospitalName ||
              data.user.organisationName ||
              "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
            website: data.user.website || ""
          });
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Handle change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/inventory/update", form);
      if (data.success) {
        alert("Profile updated successfully!");
        navigate("/profile");
      }
    } catch (error) {
      console.log("Error updating profile:", error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="card-body">
          <h2 className="mb-4 text-center text-primary">Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <input
              className="form-control mb-3"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              className="form-control mb-3"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <input
              className="form-control mb-3"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              required
            />
            <input
              className="form-control mb-3"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              required
            />
            <input
              className="form-control mb-3"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="Website"
            />

            <div className="d-flex justify-content-between mt-4">
              <button type="submit" className="btn btn-success">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
