let blocked = false;

const blockedwebsites = [
  "chrome://",
  "https://chrome.google.com/webstore/",
  "chrome-extension://",
  "https://chromewebstore.google.com",
  ".google.com",
];

function checkList(url) {
  let res;
  blockedwebsites.forEach((ele) => {
    if (url.includes(ele)) {
      res = true;
      return;
    }
  });

  return res;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    blocked = checkList(tab.url);

    if (blocked) {
      return;
    } else {
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
    }
  }
});
