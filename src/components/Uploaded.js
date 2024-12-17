import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./HomePage.css";
import Nav from "./Nav"; // Import the Nav component

function Uploaded() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [cid, setCid] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState([""]);

  const PINATA_API_KEY = "70b0282815b774ceb4ba";
  const PINATA_SECRET_KEY =
    "d5bfd047da5cd9781fadc9785d1da12a08118920d5536000483e09b7a5e065f5";

  const popupContentRef = useRef(null);

  useEffect(() => {
    if (popupContentRef.current) {
      popupContentRef.current.scrollTop = popupContentRef.current.scrollHeight;
    }
  }, [showModal, file, walletAddresses]);

  const handleDrop = (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setShowModal(true);
    }
    setIsDragging(false);
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setShowModal(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    setIsDragging(false);
  };

  const addWalletAddress = () => {
    setWalletAddresses([...walletAddresses, ""]);
  };

  const updateWalletAddress = (index, value) => {
    const updatedAddresses = [...walletAddresses];
    updatedAddresses[index] = value;
    setWalletAddresses(updatedAddresses);
  };

  const removeWalletAddress = (index) => {
    setWalletAddresses(walletAddresses.filter((_, i) => i !== index));
  };

  const storeWalletAddresses = (cid, addresses) => {
    localStorage.setItem(cid, JSON.stringify(addresses));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFile(null);
    setFileName("");
    setWalletAddresses([""]);
    const fileInput = document.querySelector(".file-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            maxBodyLength: Infinity,
            headers: {
              "Content-Type": "multipart/form-data",
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_SECRET_KEY,
            },
          }
        );

        const fileCID = response.data.IpfsHash;
        setCid(fileCID);
        storeWalletAddresses(fileCID, walletAddresses);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    setShowModal(false);
    handleModalClose();
  };

  return (
    <>
      <Nav /> {/* Place Nav here */}
      <div
        className={`file-upload ${isDragging ? "dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <h1>Drag and drop your file here</h1>
        <p>or</p>
        <div>
          <label className="custom-file-button">
            Select your File
            <input
              type="file"
              accept=".doc, .docx"
              className="file-input"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {cid && (
          <div>
            <p>File uploaded successfully!</p>
            <p>File CID: {cid}</p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View File
            </a>
          </div>
        )}
        {showModal && (
          <div className="popup">
            <div className="popup-content" ref={popupContentRef}>
              <h3>File Details</h3>
              <h4>{file.name}</h4>
              <button
                className="change-file-button"
                type="button"
                onClick={() => document.querySelector(".file-input").click()}
              >
                Change File
              </button>
              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Access:</label>
                <input type="text" value="Read Only" readOnly />
              </div>
              <div className="form-group">
                <label>Wallet Addresses:</label>
                {walletAddresses.map((address, index) => (
                  <div key={index} className="wallet-address-field">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) =>
                        updateWalletAddress(index, e.target.value)
                      }
                    />
                    <button onClick={() => removeWalletAddress(index)}>
                      -
                    </button>
                  </div>
                ))}
                <button onClick={addWalletAddress}>+</button>
              </div>
              <div className="popup-actions">
                <button onClick={handleModalClose}>Close</button>
                <button onClick={handleUpload}>Upload File</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Uploaded;
