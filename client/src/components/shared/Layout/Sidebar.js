import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../../styles/Layout.css";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  return (
    <div>
      <div className="sidebar">
        <div className="menu">

          {/* ============= Organisation Role ============= */}
          {user?.role === "organisation" && (
            <>
              <div className={`menu-item ${location.pathname === "/" && "active"}`}>
                <i className="fa-solid fa-warehouse"></i>
                <Link to="/">Inventory</Link>
              </div>
              <div className={`menu-item ${location.pathname === "/donar" && "active"}`}>
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donar">Donar</Link>
              </div>
              <div className={`menu-item ${location.pathname === "/hospital" && "active"}`}>
                <i className="fa-solid fa-hospital"></i>
                <Link to="/hospital">Hospital</Link>
              </div>
            </>
          )}

          {/* ============= Admin Role ============= */}
          {user?.role === "admin" && (
            <>
              <div className={`menu-item ${location.pathname === "/donar-list" && "active"}`}>
                <i className="fa-solid fa-user"></i>
                <Link to="/donar-list">Donar List</Link>
              </div>
              <div className={`menu-item ${location.pathname === "/hospital-list" && "active"}`}>
                <i className="fa-solid fa-hospital"></i>
                <Link to="/hospital-list">Hospital List</Link>
              </div>
              <div className={`menu-item ${location.pathname === "/org-list" && "active"}`}>
                <i className="fa-solid fa-building"></i>
                <Link to="/org-list">Organisation List</Link>
              </div>
            </>
          )}

          {/* ============= Donar Role ============= */}
          {user?.role === "donar" && (
            <>
              <div className={`menu-item ${location.pathname === "/organisation" && "active"}`}>
                <i className="fa-solid fa-building"></i>
                <Link to="/organisation">Organisation</Link>
              </div>
              <div className={`menu-item ${location.pathname === "/donation" && "active"}`}>
                <i className="fa-solid fa-hand-holding-droplet"></i>
                <Link to="/donation">Donation</Link>
              </div>
            </>
          )}

          {/* ============= Hospital Role ============= */}
          {user?.role === "hospital" && (
            <>
              <div className={`menu-item ${location.pathname === "/consumer" && "active"}`}>
                <i className="fa-solid fa-users"></i>
                <Link to="/consumer">Consumer</Link>
              </div>
              <div className={`menu-item ${location.pathname === "/donar" && "active"}`}>
                <i className="fa-solid fa-hand-holding-droplet"></i>
                <Link to="/donar">Donors</Link>
              </div>
            </>
          )}

          {/* ============= Common Profile Option (for all roles) ============= */}
          <div className={`menu-item ${location.pathname === "/profile" && "active"}`}>
            <i className="fa-solid fa-user"></i>
            <Link to="/profile">Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
