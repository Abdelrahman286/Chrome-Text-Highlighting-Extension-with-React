if (typeof initExtension == "undefined") {
  async function initExtension() {
    // shadow root element
    const shadowRootElementStyle = `
    <style>
    :root {
    --main-bg-color: #313337;
    }

    .myspan {
    /* color: yellow; */
    background: #00ffd9;
    /* text-decoration: line-through; */
    cursor: pointer;
    padding: 0 4px;
    
    }

    button {
    user-select: none;
    }

    body {
    /* position: relative; */
    /* we disabled it because of youtube fullscreen player  */
    }

    .control-box {
    /* border: 2px dashed blue; */
    background-color: var(--main-bg-color);
    position: absolute;
    z-index: 100000;
    padding: 5px;
    display: block;
    border-radius: 15px;
    /* width: 260px; */
    }

    .show {
    display: block;
    }

    .arrow-up-icon {
    width: 0px;
    height: 0px;
    /* background: red; */
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 15px solid var(--main-bg-color);
    display: block;
    }

    .unwrap-btn {
    padding: 3px 10px;
    margin: 4px 0px;
    }

    .close-btn {
    margin-left: 10px;
    float: right;

    }

    .highlight-option {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin: 0 3px;
    border: none;
    }

    .highlight-option:focus {
    border: 2px solid white;
    }

    .highlight-icon,
    .font-icon {
    padding: 2px;
    width: 20px;

    overflow: hidden;
    }

    .highlight-icon img,
    .font-icon img {
    width: 100%;
    }
    textarea {
    width : 150px;
    }

    .highlighting-section , .font-section {

    display: flex;
    margin-top : 10px;


    }

    .unwrap-section {
    border-bottom : 1px solid gray;
    }

    .notes-section {

    padding : 3px;
    display: flex;
    justify-content : space-between;
    }
    .notes-section textarea {
    width : 200px;
    height: 50px;
    margin : 0 4px;
    }

    .notes-section select {
    align-self: end;  
    padding : 4px;
    }
    </style>`;

    function _el(selector) {
      return document.querySelector(selector);
    }
    // GLOBAL VARIABLES
    let selObj = undefined;
    let range = undefined;
    let controlBoxIsShown = false;
    const CONTROL_BOX_WIDTH = 200;
    const pageBody = _el("body");
    const shadowRootContainer = document.createElement("div");
    shadowRootContainer.classList.add("shadow-root-container");
    pageBody.insertBefore(shadowRootContainer, pageBody.firstChild);
    const myNewRoot = shadowRootContainer.attachShadow({
      mode: "closed",
    });
    myNewRoot.innerHTML = shadowRootElementStyle;

    // colors
    const highlightColorsObj = await chrome.storage.sync.get([
      "HIGHLIGHT_COLORS",
    ]);
    const fontColorsObj = await chrome.storage.sync.get(["FONT_COLORS"]);
    const shortcutConfigObj = await chrome.storage.sync.get([
      "SHORTCUT_CONFIG",
    ]);

    const highlightingPallete =
      Object.entries(highlightColorsObj).length !== 0
        ? Object.entries(highlightColorsObj)[0][1]
        : [];
    const fontPallete =
      Object.entries(fontColorsObj).length !== 0
        ? Object.entries(fontColorsObj)[0][1]
        : [];

    const shortcutConfig = Object.entries(shortcutConfigObj)[0][1];

    // adding highlight image
    const highlightImg = document.createElement("img");
    const fontImg = document.createElement("img");
    highlightImg.src = chrome.runtime.getURL("highlighter.png");
    fontImg.src = chrome.runtime.getURL("text.png");

    // LAST USED CONFIG
    const lastUsedFontColorObj = await chrome.storage.sync.get([
      "LAST_USED_FONT_COLOR",
    ]);

    const lastUsedBgColorObj = await chrome.storage.sync.get([
      "LAST_USED_BG_COLOR",
    ]);

    const lastUsedFolderObj = await chrome.storage.sync.get([
      "LAST_USED_FOLDER",
    ]);

    let lastUsedBgColor = Object.entries(lastUsedBgColorObj)[0][1];
    let lastUsedFontColor = Object.entries(lastUsedFontColorObj)[0][1];
    let lastUsedFolder = Object.entries(lastUsedFolderObj)[0][1];

    async function updateLastUsedBgColor(color) {
      await chrome.storage.sync.set({ LAST_USED_BG_COLOR: color });
    }

    async function updateLastUsedFontColor(color) {
      await chrome.storage.sync.set({ LAST_USED_FONT_COLOR: color });
    }

    async function saveHighlights(
      text,
      url,
      uuid,
      lastUsedBgColor,
      lastUsedFontColor,
      note
    ) {
      // save inside a folder
      if (lastUsedFolder !== "0") {
        // console.log(lastUsedFolder);
        // save in local storage
        const currentDate = Date.now();
        if (chrome.storage) {
          await chrome.storage.local.set({
            [uuid]: {
              text: text,
              url: url,
              date: currentDate,
              bgColor: lastUsedBgColor,
              fontColor: lastUsedFontColor,
              note,
            },
          });
        }
        // save in selected folder
        await saveNoteInFolder(uuid, lastUsedFolder);
      }
    }

    async function updateNoteContent(uuid, note) {
      const oldRecord = await chrome.storage.local.get([uuid]);
      if (Object.entries(oldRecord).length == 0) return;
      const oldEntries = Object.entries(oldRecord)[0][1];

      // saving the new record
      await chrome.storage.local.set({
        [uuid]: {
          text: oldEntries.text,
          url: oldEntries.url,
          date: oldEntries.date,
          bgColor: oldEntries.bgColor,
          fontColor: oldEntries.fontColor,
          note: note,
        },
      });
    }

    async function updateBgColor(uuid, color) {
      const oldRecord = await chrome.storage.local.get([uuid]);
      if (Object.entries(oldRecord).length == 0) return;
      const oldEntries = Object.entries(oldRecord)[0][1];

      // saving the new record
      await chrome.storage.local.set({
        [uuid]: {
          text: oldEntries.text,
          url: oldEntries.url,
          date: oldEntries.date,
          bgColor: color,
          fontColor: oldEntries.fontColor,
          note: oldEntries.note,
        },
      });
    }
    async function updateFontColor(uuid, color) {
      const oldRecord = await chrome.storage.local.get([uuid]);
      if (Object.entries(oldRecord).length == 0) return;
      const oldEntries = Object.entries(oldRecord)[0][1];

      // saving the new record
      await chrome.storage.local.set({
        [uuid]: {
          text: oldEntries.text,
          url: oldEntries.url,
          date: oldEntries.date,
          bgColor: oldEntries.bgColor,
          fontColor: color,
          note: oldEntries.note,
        },
      });
    }

    function unwrap(el) {
      const pp = el.parentNode;
      if (el && el.parentNode) {
        while (el.firstChild) {
          el.parentNode.insertBefore(el.firstChild, el);
        }
        el.remove();
        pp.normalize();
      }
    }

    //------------- Handling Folders functions

    async function getFoldersList() {
      const list = await chrome.storage.sync.get(["Folders"]);
      if (Object.entries(list).length > 0) {
        return Object.entries(list)[0][1];
      } else {
        return [];
      }
    }

    async function deleteFromAllFolders(uuid) {
      const folderList = await getFoldersList();
      // the note will be inside only one folder
      const newFolders = [];

      folderList.forEach((folder) => {
        if (folder.content.includes(uuid)) {
          const newFolderObj = {
            name: folder.name,
            content: folder.content.filter((id) => id !== uuid),
          };

          newFolders.push(newFolderObj);
        } else {
          newFolders.push(folder);
        }
      });

      await chrome.storage.sync.set({ Folders: newFolders });
    }

    async function saveNoteInFolder(uuid, folderName) {
      const folderList = await getFoldersList();
      // the note will be inside only one folder
      const newFolders = [];

      folderList.forEach((folder) => {
        if (folder.name === folderName) {
          const newFolderObj = {
            name: folder.name,
            content: [...folder.content, uuid],
          };

          newFolders.push(newFolderObj);
        } else {
          newFolders.push(folder);
        }
      });

      await chrome.storage.sync.set({ Folders: newFolders });
    }

    async function updateLastUsedFolder(folderName) {
      await chrome.storage.sync.set({ LAST_USED_FOLDER: folderName });
    }

    // CONTROL BOX COMPONENT
    async function createControlBox(
      posX,
      posY,
      highlightingPallete,
      pageBody,
      currentSelect
    ) {
      const controlBox = document.createElement("div");
      controlBox.classList.add("control-box");
      controlBox.style.width = CONTROL_BOX_WIDTH;
      controlBox.style.left = `${posX}px`;
      controlBox.style.top = `${posY}px`;

      // prevent the control-box from closing when i press inside it
      controlBox.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // arrow up
      const arrowUpIcon = document.createElement("div");
      arrowUpIcon.classList.add("arrow-up-icon");
      // the padding of controlbox is 10 + 15 the width of the arrow
      arrowUpIcon.style.marginLeft = `${CONTROL_BOX_WIDTH / 2 - 25}px`;
      arrowUpIcon.style.marginTop = "-18px";
      arrowUpIcon.style.marginBottom = "5px";
      controlBox.appendChild(arrowUpIcon);

      // close button
      const closeBtn = document.createElement("button");
      closeBtn.innerText = "X";
      closeBtn.classList.add("close-btn");
      controlBox.appendChild(closeBtn);
      closeBtn.addEventListener("click", (e) => {
        // e.stopPropagation();

        controlBoxIsShown = false;
        controlBox.remove();
      });

      //-------------- Highlighting section -------------------------------
      const highlightingSection = document.createElement("div");
      highlightingSection.classList.add("highlighting-section");

      const highlightIcon = document.createElement("div");
      highlightIcon.classList.add("highlight-icon");
      highlightIcon.appendChild(highlightImg);
      highlightingSection.appendChild(highlightIcon);
      highlightingPallete.forEach((ele) => {
        const value = ele;
        const btn = document.createElement("button");
        btn.classList.add("highlight-option");
        btn.style.background = value;
        highlightingSection.appendChild(btn);
        btn.addEventListener("click", async (e) => {
          const UUID = currentSelect.dataset.uuid;
          lastUsedBgColor = value;
          await updateBgColor(UUID, value);
          await updateLastUsedBgColor(value);
          // console.log(UUID);
          const handleBgElements = document.querySelectorAll(
            `span[data-uuid="${UUID}"]`
          );

          handleBgElements.forEach((ele) => {
            ele.style.background = value;
          });
        });
      });

      controlBox.appendChild(highlightingSection);

      //---------------- FONT SECTION ---------------------------
      const fontSection = document.createElement("div");
      fontSection.classList.add("font-section");
      const fontIcon = document.createElement("div");
      fontIcon.classList.add("font-icon");
      fontIcon.appendChild(fontImg);
      fontSection.appendChild(fontIcon);
      // ------ font-color
      fontPallete.forEach((ele) => {
        const value = ele;
        const btn = document.createElement("button");
        btn.style.background = value;
        btn.classList.add("highlight-option");
        fontSection.appendChild(btn);
        btn.addEventListener("click", async (e) => {
          const UUID = currentSelect.dataset.uuid;
          lastUsedFontColor = value;
          // console.log(UUID);
          await updateFontColor(UUID, value);
          await updateLastUsedFontColor(value);
          const handFontElements = document.querySelectorAll(
            `span[data-uuid="${UUID}"]`
          );

          handFontElements.forEach((ele) => {
            ele.style.color = value;
          });
        });
      });

      controlBox.appendChild(fontSection);

      //----------- Unwrap section ------------------------
      const unwrapSection = document.createElement("div");
      unwrapSection.classList.add("unwrap-section");
      // unwrap button
      const unwrapBtn = document.createElement("button");
      unwrapBtn.innerText = "🚫";
      unwrapBtn.classList.add("unwrap-btn");
      unwrapSection.appendChild(unwrapBtn);

      unwrapBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        // check if we unwrap a big text fragment
        const fragUUID = currentSelect.dataset.uuid;
        const allfragments = document.querySelectorAll(
          `span[data-uuid="${fragUUID}"]`
        );

        allfragments.forEach((ele) => unwrap(ele));
        // delete it from local storge
        if (chrome.storage) {
          await chrome.storage.local.remove([currentSelect.dataset.uuid]);
          // remove from all folders
          await deleteFromAllFolders([currentSelect.dataset.uuid]);
        }

        controlBox.remove();
        controlBoxIsShown = false;
      });

      controlBox.appendChild(unwrapSection);

      //--------------------- NOTES Section -----------------
      const notesSection = document.createElement("div");
      notesSection.classList.add("notes-section");
      const textarea = document.createElement("textarea");
      textarea.placeholder = "Write Notes...";
      textarea.style.height = "30px";
      textarea.style.padding = "6px";
      textarea.value = currentSelect.dataset.notes;
      notesSection.appendChild(textarea);

      textarea.addEventListener("input", async (e) => {
        e.stopPropagation();
        // console.log(e.target.value);
        const UUID = currentSelect.dataset.uuid;
        const handleNotesAll = document.querySelectorAll(
          `span[data-uuid="${UUID}"]`
        );
        handleNotesAll.forEach((ele) => (ele.dataset.notes = e.target.value));

        // update notes content on chrome storage
        await updateNoteContent(UUID, e.target.value);
      });

      //------------- folder options-----------------

      const folderOptions = document.createElement("select");
      const option1 = document.createElement("option");

      // don't save option
      option1.textContent = "Don't save";
      option1.value = "0"; // you can't name a folder 0
      folderOptions.appendChild(option1);
      notesSection.appendChild(folderOptions);

      // folders list from database
      const foldersList = await getFoldersList();

      if (foldersList) {
        foldersList.forEach((folder) => {
          const option = document.createElement("option");
          option.textContent = folder.name;
          option.value = folder.name;
          folderOptions.appendChild(option);
        });
      }

      folderOptions.value = lastUsedFolder;

      folderOptions.addEventListener("click", async (e) => {
        lastUsedFolder = e.target.value;
        if (e.target.value == "0") {
          await deleteFromAllFolders(currentSelect.dataset.uuid);
          await chrome.storage.local.remove([currentSelect.dataset.uuid]);
        } else {
          // save not in local storage (override)
          let wholeText = "";
          document
            .querySelectorAll(`span[data-uuid="${currentSelect.dataset.uuid}"]`)
            .forEach((ele) => {
              wholeText += ele.textContent;
            });
          // console.log(wholeText);
          await deleteFromAllFolders(currentSelect.dataset.uuid);
          await saveHighlights(
            wholeText,
            window.location.href,
            currentSelect.dataset.uuid,
            currentSelect.style.background,
            currentSelect.style.color,
            currentSelect.dataset.note
          );

          // save UUID key in folder
          await saveNoteInFolder(currentSelect.dataset.uuid, e.target.value);
        }
        await updateLastUsedFolder(e.target.value);
        controlBox.remove();
        controlBoxIsShown = false;
      });

      controlBox.appendChild(notesSection);
      myNewRoot.appendChild(controlBox);
    }

    document.addEventListener("mouseup", (e) => {
      selObj = document.getSelection();

      if (window.getSelection().rangeCount >= 1) {
        range = document.getSelection().getRangeAt(0);
      }
    });

    function isBlank(str) {
      return !str || /^\s*$/.test(str);
    }

    function wrapHighlightedText(range, uuid) {
      // it does not save anything to database
      const wrapper_highlight = document.createElement("span");
      wrapper_highlight.classList.add("myspan");
      wrapper_highlight.style.color = lastUsedFontColor;
      wrapper_highlight.style.background = lastUsedBgColor;
      wrapper_highlight.dataset.notes = "";
      // add the uuid here
      wrapper_highlight.dataset.uuid = uuid;
      range.surroundContents(wrapper_highlight);
    }

    document.addEventListener("keypress", async (e) => {
      if (
        e.code == "KeyH" &&
        e.shiftKey == shortcutConfig["shift"] &&
        e.ctrlKey == shortcutConfig["ctrl"] &&
        e.altKey == shortcutConfig["alt"]
      ) {
        const uuid = crypto.randomUUID();

        if (range) {
          const isSafeRange = range.startContainer === range.endContainer;
          if (isSafeRange && !range.collapsed && !isBlank(range.toString())) {
            //-------- Stop it from adding new spans
            if (range.startContainer.nodeName == "#text") {
              // save on database
              const note = "";
              await saveHighlights(
                range.toString(),
                window.location.href,
                uuid,
                lastUsedBgColor,
                lastUsedFontColor,
                note
              );

              wrapHighlightedText(range, uuid); // it affects the current dom
              selObj.removeAllRanges(); // to remove the blue selection
              range = null;
            }
          } else if (!range.collapsed) {
            // not safe range
            handleBigRange(range, uuid);
            range = null; // to prevent adding multiple surrounds
          }
        }
      }
    });

    async function handleBigRange(range, uuid) {
      let wholeTextFragments = "";
      let safeRanges = getSafeRanges(range);
      for (let i = 0; i < safeRanges.length; i++) {
        if (
          !safeRanges[i].collapsed &&
          range.startContainer.nodeName == "#text" &&
          range.endContainer.nodeName == "#text" &&
          safeRanges[i].toString().match(/\w+/g) !== null &&
          !isBlank(range.toString())
        ) {
          // console.log(safeRanges[i]);
          wrapHighlightedText(safeRanges[i], uuid);
          wholeTextFragments += safeRanges[i].toString();
        }
      }

      // console.log(wholeTextFragments);
      if (!isBlank(wholeTextFragments)) {
        const note = "";

        await saveHighlights(
          wholeTextFragments,
          window.location.href,
          uuid,
          lastUsedBgColor,
          lastUsedFontColor,
          note
        );
        selObj.removeAllRanges();
      }
    }

    // ------------------- THIS IS THE ONLY FUNCTION I STOLE
    function getSafeRanges(dangerous) {
      var a = dangerous.commonAncestorContainer;
      // Starts -- Work inward from the start, selecting the largest safe range
      var s = new Array(0),
        rs = new Array(0);
      if (dangerous.startContainer != a) {
        for (var i = dangerous.startContainer; i != a; i = i.parentNode) {
          s.push(i);
        }
      }
      if (s.length > 0) {
        for (var i = 0; i < s.length; i++) {
          var xs = document.createRange();
          if (i) {
            xs.setStartAfter(s[i - 1]);
            xs.setEndAfter(s[i].lastChild);
          } else {
            xs.setStart(s[i], dangerous.startOffset);
            xs.setEndAfter(
              s[i].nodeType == Node.TEXT_NODE ? s[i] : s[i].lastChild
            );
          }
          rs.push(xs);
        }
      }

      // Ends -- basically the same code reversed
      var e = new Array(0),
        re = new Array(0);
      if (dangerous.endContainer != a) {
        for (var i = dangerous.endContainer; i != a; i = i.parentNode) {
          e.push(i);
        }
      }
      if (e.length > 0) {
        for (var i = 0; i < e.length; i++) {
          var xe = document.createRange();
          if (i) {
            xe.setStartBefore(e[i].firstChild);
            xe.setEndBefore(e[i - 1]);
          } else {
            xe.setStartBefore(
              e[i].nodeType == Node.TEXT_NODE ? e[i] : e[i].firstChild
            );
            xe.setEnd(e[i], dangerous.endOffset);
          }
          re.unshift(xe);
        }
      }

      // Middle -- the uncaptured middle
      if (s.length > 0 && e.length > 0) {
        var xm = document.createRange();
        xm.setStartAfter(s[s.length - 1]);
        xm.setEndBefore(e[e.length - 1]);
      } else {
        return [dangerous];
      }

      // Concat
      rs.push(xm);
      response = rs.concat(re);

      // Send to Console
      return response;
    }

    document.addEventListener("contextmenu", (e) => {
      if (e.target.classList.contains("myspan")) {
        e.preventDefault();

        const oldControlBox = document.querySelector(".control-box");
        if (oldControlBox) {
          oldControlBox.remove();
        }

        const boundingBox = e.target.getBoundingClientRect();
        let xpos =
          boundingBox.x + boundingBox.width / 2 - CONTROL_BOX_WIDTH / 2;
        if (xpos < 0) {
          xpos = 5;
        }
        let ypos = boundingBox.bottom + boundingBox.height + window.scrollY;

        // let ypos = boundingBox.bottom;

        if (!controlBoxIsShown) {
          createControlBox(xpos, ypos, highlightingPallete, pageBody, e.target);
          controlBoxIsShown = true;
        }
      }
    });

    // close the control box when user clicks outside it's boundary
    document.addEventListener("click", (e) => {
      const controlBox = myNewRoot.querySelector(".control-box");
      if (controlBox) {
        const classListArrayBool = Array.from(e.target.classList).includes(
          "control-box"
        );

        if (!classListArrayBool) {
          controlBox.remove();
          controlBoxIsShown = false;
        }
      }
    });
  }
  initExtension();
}
