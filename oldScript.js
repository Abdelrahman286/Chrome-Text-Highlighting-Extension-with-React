if (typeof initExtension == "undefined") {
  function initExtension() {
    function _el(selector) {
      return document.querySelector(selector);
    }
    // save highlights
    function saveHighlights(text, url, uuid) {
      // schema
      const obj = new Object();
      const currentDate = Date.now();
      obj[uuid] = {
        text: text,
        url: url,
        date: currentDate,
      };
      if (chrome.storage) {
        chrome.storage.local.set(obj).then(() => {
          console.log("text saved ");
        });
      }
    }

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

    myNewRoot.innerHTML = `
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
          margin-left: auto;
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

      </style>`;

    // adding highlight image
    const highlightImg = document.createElement("img");
    highlightImg.src = chrome.runtime.getURL("highlighter.png");
    // font icon img
    const fontImg = document.createElement("img");
    fontImg.src = chrome.runtime.getURL("text.png");

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

    // add colors dynamically
    const pallete = [
      { name: "white", value: "white" },
      { name: "black", value: "black" },
      { name: "red", value: "#ff0000" },
      { name: "green", value: "#f8ff00" },
      { name: "blue", value: "#a41a1a" },
      { name: "yellow", value: "#10ff00" },
      { name: "purple", value: "#00ffd9" },
    ];

    function createControlBox(posX, posY, pallete, pageBody, currentSelect) {
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

      const highlightIcon = document.createElement("div");
      highlightIcon.classList.add("highlight-icon");
      highlightIcon.appendChild(highlightImg);
      controlBox.appendChild(highlightIcon);
      pallete.forEach((ele) => {
        const name = ele.name;
        const value = ele.value;
        const btn = document.createElement("button");
        btn.classList.add("highlight-option");
        btn.style.background = value;
        controlBox.appendChild(btn);
        btn.addEventListener("click", (e) => {
          // e.stopPropagation();
          currentSelect.style.background = value;
        });
      });
      const fontIcon = document.createElement("div");
      fontIcon.classList.add("font-icon");
      fontIcon.appendChild(fontImg);
      controlBox.appendChild(fontIcon);
      // ------ font-color
      pallete.forEach((ele) => {
        const name = ele.name;
        const value = ele.value;
        const btn = document.createElement("button");
        btn.style.background = value;
        btn.classList.add("highlight-option");
        controlBox.appendChild(btn);
        btn.addEventListener("click", (e) => {
          // e.stopPropagation();
          currentSelect.style.color = value;
        });
      });

      // insert line
      const line3 = document.createElement("br");
      controlBox.appendChild(line3);
      // unwrap button
      const unwrapBtn = document.createElement("button");
      unwrapBtn.innerText = "🚫";
      unwrapBtn.classList.add("unwrap-btn");
      controlBox.appendChild(unwrapBtn);

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

      const line4 = document.createElement("hr");
      controlBox.appendChild(line4);

      //--------------------- textarea-----------------
      const textarea = document.createElement("textarea");
      textarea.value = currentSelect.dataset.notes;
      controlBox.appendChild(textarea);
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
      controlBox.appendChild(folderOptions);

      folderOptions.addEventListener("change", () => {
        console.log(folderOptions.value);
      });
      myNewRoot.appendChild(controlBox);
    }

    //------------ folder options

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
                range.surroundContents(wrapper_highlight);
                selObj.removeAllRanges();
                saveHighlights(range.toString(), window.location.href, uuid);
              }
            }
          } else {
            // not safe range
            console.log("highlight bigger fragment");
            let safeRanges = getSafeRanges(range);
            // console.log(safeRanges)
            for (let i = 0; i < safeRanges.length; i++) {
              // surround element here
              if (
                !safeRanges[i].collapsed &&
                range.startContainer.nodeName == "#text"
              ) {
                const newNode = document.createElement("span");
                newNode.dataset.uuid = uuid;
                newNode.classList.add("myspan");
                newNode.dataset.notes = "Add Notes";
                safeRanges[i].surroundContents(newNode);
              }

              // get text fragment & save it
              const textFragment = getTextFrag(safeRanges);
              console.log(textFragment);
              saveHighlights(textFragment, window.location.href, uuid);
              selObj.removeAllRanges();
            }
          }
        }
      }
    });

    function getTextFrag(ranges) {
      let t = "";
      ranges.forEach((r) => {
        if (r.toString()) {
          t += r.toString();
        }
      });
      return t;
    }

    //---------------- Get safe range
    function getSafeRanges(dangerous) {
      var selectionParent = dangerous.commonAncestorContainer;

      // Starts -- Work inward from the start, selecting the largest safe range
      // s --> start , rs ---> range start
      var s = new Array(0),
        rs = new Array(0);

      if (dangerous.startContainer != selectionParent) {
        // go up level in the tree by i.parentNode
        for (
          let i = dangerous.startContainer;
          i != selectionParent;
          i = i.parentNode
        ) {
          s.push(i);
          // i = textnode the contain 'one'
        }
      }

      if (s.length > 0) {
        for (var i = 0; i < s.length; i++) {
          var xs = document.createRange();
          if (i) {
            xs.setStartAfter(s[i - 1]);
            xs.setEndAfter(s[i].lastChild);
          } else {
            if (s[i]) {
              xs.setStart(s[i], dangerous.startOffset);
              xs.setEndAfter(
                s[i].nodeType == Node.TEXT_NODE ? s[i] : s[i].lastChild
              );
            }
          }

          if (xs.toString() !== "") {
            rs.push(xs);
          }
        }
      }

      // Ends -- basically the same code reversed
      var e = new Array(0),
        re = new Array(0);
      if (dangerous.endContainer != selectionParent) {
        for (
          var i = dangerous.endContainer;
          i != selectionParent;
          i = i.parentNode
        ) {
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
          if (xe.toString() !== "") {
            re.unshift(xe);
          }
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
      if (xm.toString() !== "") {
        rs.push(xm);
      }
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

        if (!controlBoxIsShown) {
          createControlBox(xpos, ypos, pallete, pageBody, e.target);
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
