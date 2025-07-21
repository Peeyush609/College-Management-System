import React from "react";
import { Navigate } from "react-router-dom";

// Utility to decode token payload (optional)
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

/**
 * @param {JSX.Element} children - The component to render
 * @param {string} allowedRole - Role allowed for this route ("admin", "student", "faculty")
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("userToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const userData = parseJwt(token);

  if (!userData || !userData.role) {
    return <Navigate to="/login" />;
  }

  if (userData.role !== allowedRole) {
    // If role does not match, redirect to user's correct dashboard
    return <Navigate to={`/${userData.role}`} />;
  }

  return children;
};

export default ProtectedRoute;
