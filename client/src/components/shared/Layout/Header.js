import React from "react";
import { BiDonateBlood, BiUserCircle } from "react-icons/bi";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    alert("Logout Successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container-fluid">
        {/* App Branding */}
        <div className="navbar-brand h1">
          <BiDonateBlood color="red" /> LifeDrop
        </div>

        {/* Nav Items */}
        <ul className="navbar-nav flex-row">
          {/* Welcome User */}
          <li className="nav-item mx-3">
            <p className="nav-link">
              <BiUserCircle /> Welcome{" "}
              {user?.name || user?.hospitalName || user?.organisationName}
              &nbsp;
              <span className="badge bg-secondary">{user?.role}</span>
            </p>
          </li>

          {/* ✅ Always show Home */}
          <li className="nav-item mx-3">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>

          {/* ✅ Show Analytics only for Organisation & Hospital */}
          {(user?.role === "organisation" || user?.role === "hospital") && (
            <li className="nav-item mx-3">
              <Link to="/analytics" className="nav-link">
                Analytics
              </Link>
            </li>
          )}

          {/* Logout */}
          <li className="nav-item mx-3">
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;

