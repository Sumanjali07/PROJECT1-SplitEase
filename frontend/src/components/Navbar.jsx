import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <div className="brand">
          <span className="brand-icon">💲</span>
          <span className="brand-name">SplitEase</span>
        </div>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>
            Home
          </NavLink>
          <NavLink
            to="/create-group"
            className={({ isActive }) => (isActive ? "nav-btn primary active" : "nav-btn primary")}
          >
            New Group
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
