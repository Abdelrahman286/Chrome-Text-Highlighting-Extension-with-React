import React from "react";
import ReactDOM from "react-dom/client";

import Folders from "../src/components/Folders";
import '../src/index.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <div>
    <Folders popup={true}></Folders>
  </div>
);
