import React, { useRef, useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
const Note = ({ uuid, data, onDeleteNote }) => {
  const menuRef = useRef();
  const [isOptionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const style = {
    background: data.bgColor,
    color: data.fontColor,
  };

  useEffect(() => {
    const handler = (e) => {
      // check if we have refrence to the element
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(e.target)) {
        // the click was outside the dropdown element
        setOptionsMenuVisible(false);
      }
    };

    document.addEventListener("click", handler, true);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);

  const handleOpenUrl = () => {
    window.open(data.url);
    setOptionsMenuVisible(false);
  };
  const handleDeleteNote = (uuid) => {
    onDeleteNote(uuid);
    setOptionsMenuVisible(false);
  };
  return (
    // place style here
    <div className="note" style={style}>
      {isOptionsMenuVisible && (
        <div className="note-options-menu" ref={menuRef}>
          <span onClick={handleOpenUrl}>open url</span>
          <span onClick={() => handleDeleteNote(uuid)}>delete</span>
        </div>
      )}

      <div className="note-content">
        <p className="note-text">{data.text}</p>
        <div
          className="note-dots-icon"
          onClick={() => setOptionsMenuVisible(true)}
        >
          <HiDotsVertical></HiDotsVertical>
        </div>
      </div>

      <p className="note-comment">{data.note}</p>
    </div>
  );
};

export default Note;
