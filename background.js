const blockedwebsites = [
  "chrome://",
  "https://chrome.google.com/webstore/",
  "chrome-extension://",
  "https://chromewebstore.google.com",
  ".google.com",
];

let blocked = false;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    blockedwebsites.forEach((ele) => {
      if (tab.url.toString().includes(ele)) {
        blocked = true;
      }
    });
  }

  if (blocked) {
    return;
  }

  // css file
  chrome.scripting.insertCSS({
    files: ["extension.css"],
    target: { tabId: tab.id },
  });

  // js file
  chrome.scripting.executeScript({
    files: ["injectedScript.js"],
    target: { tabId: tab.id },
  });
});
