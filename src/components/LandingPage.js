import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useDencrypt } from "use-dencrypt-effect";
import { useNavigate } from "react-router-dom";
import { useWallet } from "./WalletContext";
import "./LandingPage.css";

const values = ["Secured.", "Safe.", "Stable.", "SECURETHY"];

const formatText = (text) => {
  if (!text) return text;

  const parts = text.split("ETH");
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 && <span className="eth-highlight">ETH</span>}
    </span>
  ));
};

function LandingPage() {
  const { walletAddress, setWalletAddress } = useWallet(); // Use context hook
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [value, setValue] = useDencrypt("SECURETHY");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setErrorMessage("");
        navigate("/home");
      } catch (error) {
        setErrorMessage("Error connecting to wallet");
      }
    } else {
      setErrorMessage(
        "No wallet extension detected. Please install or enable wallet extension."
      );
    }
  };

  useEffect(() => {
    let i = 0;

    const action = setInterval(() => {
      setValue(values[i]);

      i = i === values.length - 1 ? 0 : i + 1;
    }, 3000);

    return () => clearInterval(action);
  }, [setValue]);

  return (
    <div className="app">
      <div className="centered-content">
        <h1 className="site-title">{formatText(value)}</h1>
        <p className="tagline">
          Store with <span>ease</span>, Share in <span>peace</span>
        </p>
        <button className="connect-wallet-button" onClick={connectWallet}>
          Connect Wallet
        </button>
        {walletAddress && (
          <p className="wallet-address">Connected: {walletAddress}</p>
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default LandingPage;
