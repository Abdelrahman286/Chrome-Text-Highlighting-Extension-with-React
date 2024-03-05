import React, { useEffect, useRef, useState } from "react";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { FaFolder } from "react-icons/fa";
const Folder = ({
  folderName,
  currentFolder,
  handleDeleteFolder,
  handleRenameFolder,
  onCurrentFolderChange,
}) => {
  const optionsMenuRef = useRef();
  const [isFolderOptionsVisible, setFolderOptionsVisible] = useState(false);
  const [isEditig, setIsEditing] = useState(false);
  const [folderNameIn, setFolderNameIn] = useState(folderName);

  const handleFolderNameChange = (e) => {
    setFolderNameIn(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleRenameFolder(folderName, folderNameIn);
    setFolderOptionsVisible(false);
    setIsEditing(false);
  };
  useEffect(() => {
    const handler = (e) => {
      // check if we have refrence to the element
      if (!optionsMenuRef.current) {
        return;
      }
      if (!optionsMenuRef.current.contains(e.target)) {
        // the click was outside the dropdown element
        setFolderOptionsVisible(false);
      }
    };

    const cancelEdit = (e) => {
      if (e.key == "Escape") {
        setIsEditing(false);
        setFolderOptionsVisible(false);
      }
    };

    document.addEventListener("keyup", cancelEdit, true);
    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("keyup", cancelEdit, true);
    };
  }, []);

  const activeFolder = currentFolder == folderName ? "active-folder" : "";
  return (
    <div>
      {isEditig ? (
        <div className="folder">
          <form onSubmit={handleSubmit}>
            <input
              value={folderNameIn}
              onChange={handleFolderNameChange}
            ></input>
          </form>
        </div>
      ) : (
        <div
          className={`folder ${activeFolder}`}
          onClick={() => onCurrentFolderChange(folderName)}
        >
          <div className="folder-left-side">
            <span>
              <FaFolder></FaFolder>
            </span>
            <span>{folderName}</span>
          </div>

          <span
            className="folder-dots"
            onClick={() => setFolderOptionsVisible(true)}
          >
            <HiDotsVertical></HiDotsVertical>
          </span>

          {isFolderOptionsVisible && (
            <div className="folder-options" ref={optionsMenuRef}>
              <span
                className="ml-8 rename-folder folder-option"
                onClick={() => setIsEditing(true)}
              >
                <MdDriveFileRenameOutline></MdDriveFileRenameOutline>
                <span>Rename</span>
              </span>
              <span
                className="delete-folder folder-option"
                onClick={() => handleDeleteFolder(folderName)}
              >
                <MdDelete></MdDelete>
                <span>Delete</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Folder;
