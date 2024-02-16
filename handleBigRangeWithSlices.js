function handleBigRange(range) {
  if (!range.collapsed) {
    const parent =
      range.commonAncestorContainer.nodeName === "#text"
        ? range.commonAncestorContainer.parentNode
        : range.commonAncestorContainer;
    const start =
      range.startContainer.nodeName === "#text"
        ? range.startContainer.parentNode
        : range.startContainer;
    const end =
      range.endContainer.nodeName === "#text"
        ? range.endContainer.parentNode
        : range.endContainer;

    const newChildren = document.createElement("div");
    const childrenArray = Array.from(parent.children);

    // sart and end index
    const startIndex = childrenArray.indexOf(start);
    const endIndex = childrenArray.indexOf(end);

    const startElements = childrenArray.slice(0, startIndex);
    if (startIndex !== 0) {
      startElements.forEach((child) => {
        newChildren.appendChild(child);
      });
    }

    const middleElements = childrenArray.slice(startIndex, endIndex + 1);

    // appending middle Elements
    const middleWrapper = document.createElement("div");
    middleWrapper.classList.add("myspan");
    middleElements.forEach((child) => {
      middleWrapper.appendChild(child);
    });
    newChildren.appendChild(middleWrapper);

    // appending end elements
    const endElements = childrenArray.slice(endIndex + 1);
    if (childrenArray.length !== endIndex + 1) {
      endElements.forEach((child) => {
        newChildren.appendChild(child);
      });
    }

    parent.innerHTML = newChildren.innerHTML;
  }
}
