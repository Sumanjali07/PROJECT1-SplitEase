import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import NewGroup from "./pages/NewGroup.jsx";
import GroupDetails from "./pages/GroupDetails.jsx";
import AddExpense from "./pages/AddExpense.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-group" element={<NewGroup />} />
          <Route path="/group/:groupId" element={<GroupDetails />} />
          <Route path="/group/:groupId/add-expense" element={<AddExpense />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
