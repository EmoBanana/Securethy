import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "./WalletContext";
import axios from "axios";
import "./Uploaded.css";
import Nav from "./Nav";

const UploadedFilesPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUploadedFile, setSelectedUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedWalletAddresses, setUploadedWalletAddresses] = useState([""]);
  const [newFile, setNewFile] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updatePosition, setUpdatePosition] = useState({ top: 0, left: 0 });
  const [activeFile, setActiveFile] = useState(null); // Track the active file
  const fileInputRef = useRef(null);
  const { walletAddress } = useWallet();
  const owner = walletAddress;

  const PINATA_API_KEY = "70b0282815b774ceb4ba";
  const PINATA_SECRET_KEY =
    "d5bfd047da5cd9781fadc9785d1da12a08118920d5536000483e09b7a5e065f5";

  const popupContentRef = useRef(null);

  useEffect(() => {
    const files = [];
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.fileName && data.owner === walletAddress) {
            files.push({
              cid: key,
              fileName: data.fileName,
              date: new Date(data.date).toLocaleDateString(),
              addresses: data.addresses || [],
            });
          }
        } catch (error) {
          console.error("Error parsing localStorage item:", error);
        }
      }
    }
    setUploadedFiles(files);
  }, [walletAddress]);

  const handleEllipsisClick = (file) => {
    setSelectedUploadedFile(file);
    setUploadedFileName(file.fileName);
    setUploadedWalletAddresses(file.addresses);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setUploadedFileName("");
    setUploadedWalletAddresses([""]);
    setNewFile(null);
  };

  const handleFileChangeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setNewFile(selectedFile);
  };

  const updateUploadedWalletAddress = (index, newAddress) => {
    const updatedAddresses = [...uploadedWalletAddresses];
    updatedAddresses[index] = newAddress;
    setUploadedWalletAddresses(updatedAddresses);
  };

  const addUploadedWalletAddress = () => {
    setUploadedWalletAddresses([...uploadedWalletAddresses, ""]);
  };

  const removeUploadedWalletAddress = (index) => {
    const updatedAddresses = [...uploadedWalletAddresses];
    updatedAddresses.splice(index, 1);
    setUploadedWalletAddresses(updatedAddresses);
  };

  const handleUploadChanges = async () => {
    if (!uploadedFileName.trim()) {
      alert("Please provide a file name.");
      return;
    }

    try {
      if (selectedUploadedFile) {
        let fileCID = selectedUploadedFile.cid;

        if (newFile) {
          const formData = new FormData();
          formData.append("file", newFile);

          const fileResponse = await axios.post(
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

          fileCID = fileResponse.data.IpfsHash;
          console.log("Replaced file CID:", fileCID);

          localStorage.removeItem(selectedUploadedFile.cid);
        }

        const metadata = {
          addresses:
            uploadedWalletAddresses.length > 0
              ? uploadedWalletAddresses
              : ["Not Shared"],
          date: new Date().toISOString(),
          owner: walletAddress,
          fileName: uploadedFileName,
        };

        await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          metadata,
          {
            headers: {
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_SECRET_KEY,
            },
          }
        );

        localStorage.setItem(fileCID, JSON.stringify(metadata));

        const updatedFiles = uploadedFiles.map((file) => {
          if (file.cid === selectedUploadedFile.cid) {
            return {
              ...file,
              cid: fileCID,
              fileName: uploadedFileName,
              addresses: uploadedWalletAddresses,
            };
          }
          return file;
        });

        setUploadedFiles(updatedFiles);
        alert("File updated successfully.");
      }
    } catch (error) {
      console.error("Error updating file:", error);
      alert("Error updating file.");
    }

    setShowModal(false);
  };

  const handleDelete = (file) => {
    try {
      localStorage.removeItem(file.cid);

      const updatedFiles = uploadedFiles.filter(
        (uploadedFile) => uploadedFile.cid !== file.cid
      );
      setUploadedFiles(updatedFiles);

      setUpdateOpen(false);
      alert("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file.");
    }
  };

  const toggleUpdate = (event, file) => {
    if (activeFile === file) {
      setActiveFile(null);
    } else {
      setActiveFile(file);

      const rect = event.target.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 5;
      const left = rect.left + window.scrollX - 43;

      setUpdatePosition({ top, left });
    }
  };

  return (
    <>
      <Nav />
      <div className="uploaded">
        <h1 className="uploaded-h1">Uploaded File</h1>
        {uploadedFiles.length === 0 ? (
          <div className="empty">
            <img
              src="../Empty.jpg"
              alt="No files found"
              className="empty-image"
            />
            <h1>No files uploaded by this wallet address.</h1>
          </div>
        ) : (
          <table className="uploaded-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>File CID</th>
                <th>Date Uploaded</th>
                <th>Guest Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file, index) => (
                <tr key={index}>
                  <td>{file.fileName}</td>
                  <td>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${file.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.cid}
                    </a>
                  </td>
                  <td>{file.date}</td>
                  <td>
                    {file.addresses === "Not Shared" ? (
                      <span>Not Shared</span>
                    ) : (
                      <select>
                        {file.addresses.map((address, idx) => (
                          <option key={idx} value={address}>
                            {address}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <button
                      className="ellipsis-button"
                      onClick={(e) => toggleUpdate(e, file)}
                    >
                      ...
                    </button>
                    {activeFile === file && (
                      <div
                        className="update-menu"
                        style={{
                          top: `${updatePosition.top}px`,
                          left: `${updatePosition.left}px`,
                        }}
                      >
                        <button onClick={() => handleEllipsisClick(file)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(file)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && selectedUploadedFile && (
          <div className="popup">
            <div className="popup-content" ref={popupContentRef}>
              <h3 className="uploaded-h3">File Details</h3>

              <div className="change-file">
                <h2>
                  Attached File:
                  <br />
                  {selectedUploadedFile.fileName}
                </h2>
                <button
                  className="change-file-button"
                  type="button"
                  onClick={handleFileChangeClick}
                >
                  Change File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  value={uploadedFileName}
                  placeholder={selectedUploadedFile.fileName}
                  onChange={(e) => setUploadedFileName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>File Access:</label>
                <input type="text" value="Read Only" readOnly />
              </div>

              <div className="wallet-group">
                <label>Guest Access:</label>
                <div className="wallet-address-field">
                  {uploadedWalletAddresses.map((address, index) => (
                    <div key={index}>
                      <div className="input-container">
                        <input
                          className="input-fields"
                          type="text"
                          value={address}
                          placeholder="Wallet Address"
                          onChange={(e) =>
                            updateUploadedWalletAddress(index, e.target.value)
                          }
                        />
                        <button
                          className="remove-button"
                          onClick={() => removeUploadedWalletAddress(index)}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="add-button">
                  <button onClick={addUploadedWalletAddress}>+</button>
                </div>
              </div>

              <div className="uploaded-popup-actions">
                <button onClick={handleUploadChanges}>Update</button>
                <button onClick={handleModalClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadedFilesPage;
