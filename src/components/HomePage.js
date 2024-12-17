import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "./WalletContext";
import axios from "axios";
import "./HomePage.css";
import Nav from "./Nav";

function Home() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [cid, setCid] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState([""]);
  const { walletAddress } = useWallet();

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

  const storeWalletAddresses = (cid, addresses, owner, fileName) => {
    const currentDate = new Date().toISOString();
    const data = {
      addresses: addresses.length > 0 ? addresses : ["Not Shared"], // Handle empty addresses
      date: currentDate,
      owner,
      fileName,
    };
    localStorage.setItem(cid, JSON.stringify(data));
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
    if (!fileName.trim()) {
      alert("Please provide a file name.");
      return;
    }

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
        console.log("Uploaded file CID:", fileCID);

        // Filter out empty wallet addresses
        const validWalletAddresses = walletAddresses.filter(
          (address) => address.trim() !== ""
        );
        storeWalletAddresses(
          fileCID,
          validWalletAddresses.length > 0
            ? validWalletAddresses
            : ["Not Shared"],
          walletAddress,
          fileName
        );
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    setShowModal(false);
    handleModalClose();
  };

  return (
    <>
      <Nav />
      <div className="whitespace"></div>
      <div
        className={`file-upload ${isDragging ? "dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <h1>Drag and Drop Your File Here</h1>
        <p>or</p>
        <div>
          <label className="custom-file-button">
            Select From PC
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
              <div className="change-file">
                <h2>
                  Attached File:<br></br>
                  {file.name}
                </h2>
                <button
                  className="change-file-button"
                  type="button"
                  onClick={() => document.querySelector(".file-input").click()}
                >
                  Change File
                </button>
              </div>
              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  value={fileName}
                  placeholder={file.name}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>File Access:</label>
                <input type="text" value="Read Only" readOnly />
              </div>
              <div className="wallet-group">
                <label>Guest Access:</label>
                <div className="wallet-address-field">
                  {walletAddresses.map((address, index) => (
                    <div key={index}>
                      <div className="input-container">
                        <input
                          className="input-fields"
                          type="text"
                          value={address}
                          placeholder="Wallet&nbsp; Address"
                          onChange={(e) =>
                            updateWalletAddress(index, e.target.value)
                          }
                        />
                        <button
                          className="remove-button"
                          onClick={() => removeWalletAddress(index)}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="add-button">
                  <button onClick={addWalletAddress}>+</button>
                </div>
              </div>
              <div className="popup-actions">
                <button onClick={handleUpload}>Upload</button>
                <button onClick={handleModalClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
