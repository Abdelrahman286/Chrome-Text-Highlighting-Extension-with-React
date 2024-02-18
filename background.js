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

chrome.runtime.onInstalled.addListener(async (details) => {
  // details.reason = install || update

  // FOLDER INIT
  const foldersList = await chrome.storage.sync.get(["Folders"]);
  const foldersCount = Object.entries(foldersList).length;

  if (foldersCount == 0) {
    console.log("create 2 folders");

    // 1st folder
    const folder = new Object();
    folder.name = "New Folder 1";
    folder.content = [];

    // 2nd folder
    const folder2 = new Object();
    folder2.name = "New Folder 2";
    folder2.content = [];

    await chrome.storage.sync.set({ Folders: [folder, folder2] });
  }

  // LAST USED SETTING INIT
  // const LAST_USED_FONT_COLOR = await chrome.storage.sync.get([
  //   "LAST_USED_FONT_COLOR",
  // ]);

  // const LAST_USED_BG_COLOR = await chrome.storage.sync.get([
  //   "LAST_USED_BG_COLOR",
  // ]);

  // const LAST_USED_FOLDER = await chrome.storage.sync.get(["LAST_USED_FOLDER"]);

  await chrome.storage.sync.set({ LAST_USED_FONT_COLOR: "black" });

  await chrome.storage.sync.set({ LAST_USED_BG_COLOR: "yellow" });

  await chrome.storage.sync.set({ LAST_USED_FOLDER: "0" });

  let lastUsedBgColor = await chrome.storage.sync.get(["LAST_USED_FONT_COLOR"]);

  // console.log(Object.entries(lastUsedBgColor)[0][1]);
});
