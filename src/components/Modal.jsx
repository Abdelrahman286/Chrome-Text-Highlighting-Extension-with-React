import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const Modal = ({ onClose, children }) => {
  // to remove the scroll
  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    // return cleanup function
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return ReactDOM.createPortal(
    <div>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal">{children}</div>
    </div>,
    document.querySelector(".modal-container")
  );
};

export default Modal;
