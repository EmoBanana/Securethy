import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import "./Shared.css";
import Nav from "./Nav";

function Shared() {
  const { walletAddress } = useWallet();
  const [sharedFiles, setSharedFiles] = useState([]);
  const currentWallet = walletAddress;

  useEffect(() => {
    const files = [];
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key));

          if (
            fileData &&
            Array.isArray(fileData.addresses) &&
            fileData.addresses.includes(currentWallet)
          ) {
            const dateOnly = fileData.date
              ? new Date(fileData.date).toISOString().split("T")[0]
              : "Unknown";
            files.push({
              fileName: fileData.fileName || "Unknown",
              cid: key,
              date: dateOnly,
              sharedBy: fileData.owner || "Unknown",
            });
          }
        } catch (e) {
          console.error(`Error parsing localStorage item with key ${key}:`, e);
        }
      }
    }
    setSharedFiles(files);
  }, [currentWallet]);

  return (
    <>
      <Nav />
      <div className="sharedpage">
        <h1 className="shared-h1">Files Shared with Me</h1>
        {sharedFiles.length === 0 ? (
          <div className="no-files">
            <img
              src="../NoFile.jpg"
              alt="No files found"
              className="blank-image"
            />
            <h1>No files shared with this wallet address.</h1>
          </div>
        ) : (
          <table className="shared-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>File CID</th>
                <th>Date Uploaded</th>
                <th>File Owner</th>
              </tr>
            </thead>
            <tbody>
              {sharedFiles.map((file, index) => (
                <tr key={index}>
                  <td>{file.fileName}</td>
                  <td>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${file.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      {file.cid}
                    </a>
                  </td>
                  <td>{file.date}</td>
                  <td>{file.sharedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Shared;
