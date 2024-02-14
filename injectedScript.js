if (typeof initExtension == "undefined") {
  function initExtension() {
    const highlightingPallete = [
      { name: "white", value: "white" },
      { name: "black", value: "black" },
      { name: "red", value: "#ff0000" },
      { name: "green", value: "#f8ff00" },
      { name: "blue", value: "#a41a1a" },
      { name: "yellow", value: "#10ff00" },
      { name: "purple", value: "#00ffd9" },
    ];

    const fontPallete = [
      { name: "white", value: "white" },
      { name: "black", value: "black" },
    ];

    function _el(selector) {
      return document.querySelector(selector);
    }

    async function saveHighlights(text, url, uuid) {
      // schema
      const obj = new Object();
      const currentDate = Date.now();
      obj[uuid] = {
        text: text,
        url: url,
        date: currentDate,
      };

      await chrome.storage.local.set(obj);
    }

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

    // adding highlight image
    const highlightImg = document.createElement("img");
    highlightImg.src = chrome.runtime.getURL("highlighter.png");
    // font icon img
    const fontImg = document.createElement("img");
    fontImg.src = chrome.runtime.getURL("text.png");

    // CONTROL BOX COMPONENT

    function createControlBox(
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

        controlBox.remove();
        controlBoxIsShown = false;
      });

      //-------------- Highlighting section -------------------------------
      const highlightingSection = document.createElement("div");
      highlightingSection.classList.add("highlighting-section");

      const highlightIcon = document.createElement("div");
      highlightIcon.classList.add("highlight-icon");
      highlightIcon.appendChild(highlightImg);
      highlightingSection.appendChild(highlightIcon);
      highlightingPallete.forEach((ele) => {
        const name = ele.name;
        const value = ele.value;
        const btn = document.createElement("button");
        btn.classList.add("highlight-option");
        btn.style.background = value;
        highlightingSection.appendChild(btn);
        btn.addEventListener("click", (e) => {
          // e.stopPropagation();
          currentSelect.style.background = value;
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
        const name = ele.name;
        const value = ele.value;
        const btn = document.createElement("button");
        btn.style.background = value;
        btn.classList.add("highlight-option");
        fontSection.appendChild(btn);
        btn.addEventListener("click", (e) => {
          // e.stopPropagation();
          currentSelect.style.color = value;
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

      unwrapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // check if we unwrap a big text fragment
        const fragUUID = currentSelect.dataset.uuid;
        const allfragments = document.querySelectorAll(
          `span[data-uuid="${fragUUID}"]`
        );
        // console.log(allfragments.length);
        if (allfragments.length == 1) {
          unwrap(currentSelect);
        } else {
          allfragments.forEach((ele) => {
            unwrap(ele);
          });
        }
        controlBox.remove();
        // make it invisble
        controlBoxIsShown = false;
        // delete it from local storge
        if (chrome.storage) {
          // console.log(currentSelect.dataset.uuid);
          chrome.storage.local.remove([currentSelect.dataset.uuid]);
        }
      });

      controlBox.appendChild(unwrapSection);

      //--------------------- NOTES Section -----------------
      const notesSection = document.createElement("div");
      notesSection.classList.add("notes-section");
      const textarea = document.createElement("textarea");
      textarea.placeholder = "Write Some Notes...";
      // textarea.value = currentSelect.dataset.notes;
      notesSection.appendChild(textarea);
      textarea.addEventListener("click", (e) => {
        // e.stopPropagation();
      });
      textarea.addEventListener("input", (e) => {
        e.stopPropagation();
        currentSelect.dataset.notes = textarea.value;
      });

      //------------- folder options
      const folderOptions = document.createElement("select");
      const option1 = document.createElement("option");
      option1.value = "folder 1";
      option1.textContent = "folder 1";
      folderOptions.appendChild(option1);
      notesSection.appendChild(folderOptions);

      folderOptions.addEventListener("change", () => {
        console.log(folderOptions.value);
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

    document.addEventListener("keypress", (e) => {
      if (e.code == "KeyH") {
        const wrapper_highlight = document.createElement("span");
        wrapper_highlight.classList.add("myspan");
        wrapper_highlight.dataset.notes = "Add Notes";
        // add the uuid here
        const uuid = crypto.randomUUID();
        wrapper_highlight.dataset.uuid = uuid;
        if (range) {
          const isSafeRange = range.startContainer === range.endContainer;

          if (isSafeRange) {
            if (!range.collapsed && isSafeRange) {
              //-------- Stop it from adding new spans
              if (range.startContainer.nodeName == "#text") {
                console.log(range);
                range.surroundContents(wrapper_highlight);
                selObj.removeAllRanges();
                saveHighlights(range.toString(), window.location.href, uuid);
              }
            }
          } else {
            // not safe range
            console.log("big rangeeeee");
          }
        }
      }
    });

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
