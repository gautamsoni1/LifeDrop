import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import API from "../../services/API";
import { getCurrentUser } from "../../redux/features/auth/authActions";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();

  // get user current
useEffect(() => {
  const fetchUser = async () => {
    try {
      const { data } = await API.get("/auth/current-user");
      if (data?.success) {
        dispatch(getCurrentUser(data));
      }
    } catch (error) {
      localStorage.clear();
      console.log(error);
    }
  };

  fetchUser();
}, [dispatch]); // only depends on dispatch
 // ✅ run only once

  // check token
  if (localStorage.getItem("token")) {
    return children; // ✅ JSX (whatever you passed inside)
  } else {
    return <Navigate to="/login" replace />; // ✅ proper redirect
  }
};

export default ProtectedRoute;

