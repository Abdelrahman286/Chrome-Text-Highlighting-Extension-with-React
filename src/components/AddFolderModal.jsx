import React, { useState } from "react";

const AddFolderModal = ({ onModalClose, onAddingNewFolder }) => {
  const [folderName, setFolderName] = useState("");
  const handleFolderInputChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddingNewFolder(folderName);
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <p className="modal-title">Add New Folder </p>

        <div>
          <input
            placeholder="Folder Name...."
            type="text"
            className="modal-input"
            value={folderName}
            onChange={handleFolderInputChange}
          ></input>
        </div>
        <div className="modal-actions">
          <button
            className="modal-btn border-none"
            type="button"
            onClick={onModalClose}
          >
            Cancel
          </button>
          <button type="submit" className="modal-btn border-none">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFolderModal;
