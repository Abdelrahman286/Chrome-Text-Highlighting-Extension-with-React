import React, { useEffect, useState } from "react";
import { AiOutlineFontColors } from "react-icons/ai";
import { PiHighlighterCircle } from "react-icons/pi";
import { FaChrome, FaKeyboard } from "react-icons/fa6";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getFontColors, getHighlightColors, getShortcutConfig } from "../db";
const Settings = () => {
  const [fontColorList, setFontColorList] = useState([]);
  const [HighlightColorList, setHighlightColorList] = useState([]);
  const [newHighlightColor, setNewHighlightColor] = useState("#553322");
  const [newFontColor, setNewFontColor] = useState("#559954");
  const [shortcutOptions, setShortcutOptions] = useState({});

  const renderedHighlightColors = HighlightColorList.map((ele) => {
    const style = { background: ele };
    return (
      <div key={ele} className="color-option">
        <div style={style} className="color-circle"></div>
        <div
          className="close-color"
          onClick={() => handleRemoveHighlightColor(ele)}
        >
          <IoMdCloseCircleOutline></IoMdCloseCircleOutline>
        </div>
      </div>
    );
  });

  const renderedFontColors = fontColorList.map((ele) => {
    const style = { background: ele };
    return (
      <div key={ele} className="color-option">
        <div style={style} className="color-circle"></div>
        <div className="close-color" onClick={() => handleRemoveFontColor(ele)}>
          <IoMdCloseCircleOutline></IoMdCloseCircleOutline>
        </div>
      </div>
    );
  });

  // Highlight colors
  const handleAddHighlightColor = async () => {
    if (HighlightColorList.includes(newHighlightColor)) return;
    const newColorsList = [...HighlightColorList, newHighlightColor];
    setHighlightColorList(newColorsList);

    // save highlight color in storage
    await chrome.storage.sync.set({ HIGHLIGHT_COLORS: newColorsList });
  };
  const handleRemoveHighlightColor = async (colorName) => {
    const newColorsList = HighlightColorList.filter((ele) => {
      return ele !== colorName;
    });
    setHighlightColorList(newColorsList);
    await chrome.storage.sync.set({ HIGHLIGHT_COLORS: newColorsList });
  };

  // Font Colors
  const handleAddFontColor = async () => {
    if (fontColorList.includes(newFontColor)) return;
    const newColorsList = [...fontColorList, newFontColor];
    setFontColorList(newColorsList);

    await chrome.storage.sync.set({ FONT_COLORS: newColorsList });
  };
  const handleRemoveFontColor = async (colorName) => {
    const newColorsList = fontColorList.filter((ele) => {
      return ele !== colorName;
    });
    setFontColorList(newColorsList);
    await chrome.storage.sync.set({ FONT_COLORS: newColorsList });
  };

  // handle shortcut settings
  const handleRadioChange = async (e) => {
    const shortcutConfig = {
      h: e.target.value == "h",
      ctrl: e.target.value == "ctrl",
      alt: e.target.value == "alt",
      shift: e.target.value == "shift",
    };
    setShortcutOptions(shortcutConfig);
    await chrome.storage.sync.set({ SHORTCUT_CONFIG: shortcutConfig });
  };

  useEffect(() => {
    const initSettings = async () => {
      const fetchedHighlightColors = await getHighlightColors();
      setHighlightColorList(fetchedHighlightColors);
      const fetchedFontColors = await getFontColors();
      setFontColorList(fetchedFontColors);
      const fetchedShortcutConfig = await getShortcutConfig();
      setShortcutOptions(fetchedShortcutConfig);
    };
    initSettings();
  });
  return (
    <div>
      <form className="highlight-form">
        <h3 className="settings-title">
          <PiHighlighterCircle></PiHighlighterCircle> Highlight Colors
        </h3>
        <div className="form-in">
          <input
            type="color"
            value={newHighlightColor}
            onChange={(e) => setNewHighlightColor(e.target.value)}
          ></input>
          <button type="button" onClick={handleAddHighlightColor}>
            Add <IoIosAddCircleOutline></IoIosAddCircleOutline>
          </button>
        </div>
      </form>
      <div className="color-options"> {renderedHighlightColors}</div>

      {/* font colors */}

      <form className="highlight-form">
        <h3 className="settings-title">
          <AiOutlineFontColors></AiOutlineFontColors> Font Colors
        </h3>
        <div className="form-in">
          <input
            type="color"
            value={newFontColor}
            onChange={(e) => setNewFontColor(e.target.value)}
          ></input>
          <button type="button" onClick={handleAddFontColor}>
            Add <IoIosAddCircleOutline></IoIosAddCircleOutline>
          </button>
        </div>
      </form>

      <div className="color-options">{renderedFontColors}</div>

      <h3 className="settings-title shortcut-title">
        <FaKeyboard></FaKeyboard>
        Keyboard Shortcut
      </h3>
      <form className="shortcut-form">
        <div className="shortcut-option">
          <input
            type="radio"
            value="h"
            name="1"
            onChange={handleRadioChange}
            checked={shortcutOptions["h"]}
          />
          <label>
            <span className="gray-box">H</span> Key
          </label>
        </div>

        <div className="shortcut-option">
          <input
            type="radio"
            value="ctrl"
            name="1"
            onChange={handleRadioChange}
            checked={shortcutOptions["ctrl"]}
          />
          <label>
            <span className="gray-box">ctrl</span> +{" "}
            <span className="gray-box">H</span> Key
          </label>
        </div>

        <div className="shortcut-option">
          <input
            type="radio"
            value="alt"
            name="1"
            onChange={handleRadioChange}
            checked={shortcutOptions["alt"]}
          />
          <label>
            <span className="gray-box">alt</span> +{" "}
            <span className="gray-box">H</span> Key
          </label>
        </div>

        <div className="shortcut-option">
          <input
            type="radio"
            value="shift"
            name="1"
            onChange={handleRadioChange}
            checked={shortcutOptions["shift"]}
          />
          <label>
            <span className="gray-box">shift</span> +{" "}
            <span className="gray-box">H</span> Key
          </label>
        </div>
      </form>
    </div>
  );
};

export default Settings;
