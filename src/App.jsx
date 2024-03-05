import { useState } from "react";
import brandUrl from "./imgs/brand.png";
import Folders from "./components/Folders";
import AllHighlights from "./components/AllHighlights";
import Settings from "./components/Settings";

import { CiFolderOn } from "react-icons/ci";
import { IoSettings } from "react-icons/io5";
import { FaHighlighter } from "react-icons/fa";

function App() {
  const [isFoldersVisible, setIsFoldersVisible] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isHighlightsVisible, setIsHighlightsVisible] = useState(false);

  const handleFolderClick = () => {
    setIsFoldersVisible(true);
    setIsSettingsVisible(false);
    setIsHighlightsVisible(false);
  };
  const handleSettingsClikc = () => {
    setIsFoldersVisible(false);
    setIsSettingsVisible(true);
    setIsHighlightsVisible(false);
  };
  const handleHighlightsClick = () => {
    setIsFoldersVisible(false);
    setIsSettingsVisible(false);
    setIsHighlightsVisible(true);
  };

  return (
    <div>
      <header className="header">
        <img src={brandUrl}></img>
      </header>

      <main className="main-body">
        <aside>
          <span
            onClick={handleFolderClick}
            className={isFoldersVisible ? "active" : ""}
          >
            <CiFolderOn></CiFolderOn> Folders
          </span>
          <span
            onClick={handleSettingsClikc}
            className={isSettingsVisible ? "active" : ""}
          >
            <IoSettings></IoSettings> Settings
          </span>
          <span
            onClick={handleHighlightsClick}
            className={isHighlightsVisible ? "active" : ""}
          >
            <FaHighlighter></FaHighlighter>
            Highlights
          </span>
        </aside>

        <div className="tab-content">
          {isFoldersVisible && <Folders popup={false}></Folders>}
          {isHighlightsVisible && <AllHighlights></AllHighlights>}
          {isSettingsVisible && <Settings></Settings>}
        </div>
      </main>
    </div>
  );
}

export default App;
