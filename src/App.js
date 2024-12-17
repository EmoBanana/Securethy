import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { WalletProvider } from "./components/WalletContext";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import Uploaded from "./components/Uploaded";
import Shared from "./components/Shared";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/uploaded" element={<Uploaded />} />
          <Route path="/shared" element={<Shared />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
