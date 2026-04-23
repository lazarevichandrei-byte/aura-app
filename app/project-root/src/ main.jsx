import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";

function Home() {
  return <h1 style={{ padding: 20 }}>HOME PAGE</h1>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Profile />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  </BrowserRouter>
);