import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "./WalletContext";
import "./Nav.css";

function Nav() {
  const { walletAddress, setWalletAddress } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    navigate("/");
  };

  const currentPath = location.pathname;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="home" onClick={() => navigate("/home")}>
          SECUR<span>ETH</span>Y
        </h1>
        <div className="nav-links">
          <h1
            className={`nav-link ${
              currentPath === "/uploaded" ? "active" : ""
            }`}
            onClick={() => navigate("/uploaded")}
          >
            Uploaded File
          </h1>
          <h1
            className={`nav-link ${currentPath === "/shared" ? "active" : ""}`}
            onClick={() => navigate("/shared")}
          >
            Shared File
          </h1>
        </div>
      </div>

      <div className="nav-right">
        {walletAddress ? (
          <div className="wallet-info">
            <span className="wallet-address" onClick={toggleMenu}>
              {`${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`}
            </span>
          </div>
        ) : (
          <div className="wallet-info">
            <span className="wallet-address">Connect Wallet</span>
          </div>
        )}
        {menuOpen && (
          <div className="wallet-menu">
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Nav;
