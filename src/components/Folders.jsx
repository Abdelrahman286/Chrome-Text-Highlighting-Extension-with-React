import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { FaFolderPlus } from "react-icons/fa6";
import { isBlank } from "../utils";
import Folder from "./Folder";
import AddFolderModal from "./AddFolderModal";
import Note from "./Note";
import brandUrl from "../imgs/brand.png";
import { IoSettings } from "react-icons/io5";
import {
  getAllFoldersList,
  deleteFolder,
  renameFolder,
  addFolder,
  getFolderNotes,
  deleteNoteFromAllFolders,
  deleteNoteById,
} from "../db";

const Folders = ({ popup }) => {
  const [folderList, setFoldersList] = useState([]);
  const [folderNotes, setFoldersNotes] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [isAddFolderVisible, setIsAddFolderVisible] = useState(false);

  //---------- FOLDER OPERATIONS (Add, Delete ,Rename)
  const handleAddNewFolder = async (newFolderName) => {
    if (isBlank(newFolderName) || newFolderName === "0") {
      setIsAddFolderVisible(false);
      return;
    }
    while (folderList.includes(newFolderName)) {
      newFolderName += "(1)";
    }
    setFoldersList([...folderList, newFolderName]);
    setIsAddFolderVisible(false);
    await addFolder(newFolderName);
  };

  const handleDeleteFolder = async (folderName) => {
    const newFoldersList = folderList.filter((ele) => {
      return ele !== folderName;
    });
    setFoldersList(newFoldersList);
    setFoldersNotes([]);

    await deleteFolder(folderName);
  };

  const handleRenameFolder = async (originalName, newFolderName) => {
    if (isBlank(newFolderName) || newFolderName === "0") {
      return;
    }
    while (folderList.includes(newFolderName)) {
      newFolderName += "(1)";
    }
    const newFolders = folderList.map((ele) => {
      if (ele == originalName) {
        return newFolderName;
      } else {
        return ele;
      }
    });
    setFoldersList(newFolders);
    await renameFolder(originalName, newFolderName);
  };

  const handleCurrentFolderChange = (folderName) => {
    setCurrentFolder(folderName);
  };

  const renderedFoldersList = folderList.map((folder) => {
    return (
      <Folder
        key={folder}
        folderName={folder}
        currentFolder={currentFolder}
        handleDeleteFolder={handleDeleteFolder}
        handleRenameFolder={handleRenameFolder}
        onCurrentFolderChange={handleCurrentFolderChange}
      ></Folder>
    );
  });

  const handleDeleteNote = async (uuid) => {
    const newNotesList = folderNotes.filter((ele) => {
      return ele[0] !== uuid;
    });
    setFoldersNotes(newNotesList);
    await deleteNoteFromAllFolders(uuid);
    await deleteNoteById(uuid);
  };

  let renderedNotes;
  if (folderNotes.length == 0) {
    renderedNotes = <h4>Empty Folder</h4>;
  } else {
    renderedNotes = folderNotes.map((note) => {
      return (
        <Note
          key={note[0]}
          uuid={note[0]}
          data={note[1]}
          onDeleteNote={handleDeleteNote}
        ></Note>
      );
    });
  }
  useEffect(() => {
    const initFolders = async () => {
      const foldersArray = await getAllFoldersList();
      const folderNames = foldersArray.map((ele) => {
        return ele.name;
      });
      setFoldersList(folderNames);

      if (currentFolder == "") {
        setCurrentFolder(folderNames[0]);
      }
      const folderNotes = await getFolderNotes(currentFolder);
      setFoldersNotes(folderNotes);
    };

    initFolders();
  }, [currentFolder]);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage(function () {
      console.log("Options page opened");
    });
  };

  return (
    <div className="folder-tab">
      <div className="folders-list">
        {popup && (
          <div className="folder-brand-wrapper">
            <img src={brandUrl}></img>
          </div>
        )}

        <div className="add-folder" onClick={() => setIsAddFolderVisible(true)}>
          Add
          <FaFolderPlus></FaFolderPlus>
        </div>

        <div className="folder-names">{renderedFoldersList}</div>
      </div>
      <div className="folderContent">
        {popup && (
          <div className="popup-settings-icons">
            <IoSettings onClick={openOptionsPage}></IoSettings>
          </div>
        )}

        <div className="notes-list">{renderedNotes}</div>
      </div>

      {/* Modals (add new folder , delete confirmation , rename) */}
      {isAddFolderVisible && (
        <Modal onClose={() => setIsAddFolderVisible(false)}>
          <AddFolderModal
            onModalClose={() => setIsAddFolderVisible(false)}
            onAddingNewFolder={handleAddNewFolder}
          ></AddFolderModal>
        </Modal>
      )}
    </div>
  );
};

export default Folders;
