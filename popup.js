// // showing the highlighted text list & delete them
// const refresh = document.querySelector(".refresh");
// const deleteAll = document.querySelector(".delete-all");
// const box = document.querySelector(".box");

// function createRow(text, className) {
//   const rowELe = document.createElement("div");
//   rowELe.textContent = text;
//   rowELe.classList.add(className);

//   return rowELe;
// }
// function handleDeleteRow(id) {
//   chrome.storage.local.remove([id]).then(() => {
//     fetchAllStorage();
//   });
// }
// function fetchAllStorage() {
//   // read again and restart
//   box.innerHTML = "";
//   chrome.storage.local.get(null).then((res) => {
//     // console.log(Object.keys(res));
//     // console.log(Object.entries(res).length);
//     // display it in a better way
//     if (Object.entries(res).length <= 0) {
//       box.textContent = "you storage is empty";
//     } else {
//       // display them
//       const sortedData = Object.entries(res).sort((a, b) => {
//         // the newer will be at the top 
//         return b[1].date - a[1].date;
//       });

//       sortedData.forEach((ele) => {
//         const id = ele[0];
//         const text = ele[1].text;
//         const url = ele[1].url;
//         const date = new Date(ele[1].date).toLocaleTimeString();
//         const idEle = createRow(id, "id");
//         const textEle = createRow(text, "text");
//         const urlEle = createRow(url, "url");
//         const dateEle = createRow(date, "date");
//         const rowContainer = document.createElement("div");
//         rowContainer.classList.add("row-container");
//         const deleteRow = document.createElement("button");
//         deleteRow.textContent = "Delete";
//         deleteRow.dataset.id = id;

//         deleteRow.addEventListener("click", () => {
//           handleDeleteRow(deleteRow.dataset.id);
//         });

//         rowContainer.appendChild(idEle);
//         rowContainer.appendChild(textEle);
//         rowContainer.appendChild(urlEle);
//         rowContainer.appendChild(dateEle);
//         rowContainer.appendChild(deleteRow);

//         box.appendChild(rowContainer);
//       });
//     }
//   });
// }

// refresh.addEventListener("click", () => {
//   // box.style.background = "red";
//   fetchAllStorage();
// });

// deleteAll.addEventListener("click", () => {
//   chrome.storage.local.clear();
//   fetchAllStorage();
// });

// fetchAllStorage();

//========== Creating folders ============

const folderNameInput = document.querySelector(".folder-name-in");
const folderNameBtn = document.querySelector(".create-folder-btn");
const newFolderMsg = document.querySelector(".new-folder-msg");

async function isFolderNameExist(folderName) {
  const list = [];
  const r = await chrome.storage.local.get("folders");
  const li = Object.entries(r)[0][1];
  // console.log(li);
  li.forEach((ele) => {
    list.push(ele.FolderName);
  });
  const check = list.includes(folderName);

  return check;
}

folderNameBtn.addEventListener("click", async () => {
  const folderName = folderNameInput.value;
  newFolderMsg.textContent = "";
  const isNamedBefore = await isFolderNameExist(folderName);

  if (folderName == "") {
    newFolderMsg.textContent = "you can't leave it empty";
  } else if (!isNaN(folderName)) {
    newFolderMsg.textContent = "you can't name the folder with number";
  } else if (isNamedBefore) {
    newFolderMsg.textContent = "the name already exits";
  } else {
    // here we create new folder
    const folders = await chrome.storage.local.get("folders");
    const foldersArray = [...Object.entries(folders)];
    foldersArray[0][1].push({ FolderName: folderName, UUIDs: [] });
    const foldersObj = Object.fromEntries(foldersArray);
    // these 2 logs must be the same
    await chrome.storage.local.set(foldersObj);
    renderFolders();
  }
});

//------------- viewing the whole database
const viewAllBtn = document.querySelector(".view-all-database");
const contentBox = document.querySelector(".content-box");
viewAllBtn.addEventListener("click", () => {
  contentBox.innerHTML = "";
  chrome.storage.local.get(null).then((res) => {
    const data = JSON.stringify(res);
    contentBox.innerHTML = data;
  });
});

//-------------- deleting the whole database
const deleteAllBtn = document.querySelector(".delete-all");
deleteAllBtn.addEventListener("click", () => {
  chrome.storage.local.clear().then(() => {
    console.log("the whole database is cleaned");
  });
});

//---------- render folders
function renderFolders() {
  const foldersContainer = document.querySelector(".folders");
  foldersContainer.innerHTML = "";
  chrome.storage.local.get("folders").then((res) => {
    const folderRecords = Object.entries(res);
    if (folderRecords.length == 0) return;

    folderRecords[0][1].forEach((ele) => {
      const folderEle = document.createElement("div");
      folderEle.classList.add("folder");
      const folderNameEle = document.createElement("div");
      folderNameEle.classList.add("folder-name");
      folderNameEle.textContent = ele.FolderName;
      folderEle.appendChild(folderNameEle);

      // creating burger icon (replace it with icon)
      const dotEle = document.createElement("div");
      dotEle.classList.add("dot");
      const burgerEle = document.createElement("div");
      burgerEle.classList.add("folder-burger");
      burgerEle.appendChild(dotEle);
      folderEle.appendChild(burgerEle);
      foldersContainer.appendChild(folderEle);

      //---delete
      // adding the float menu
      const floatMenu = document.createElement("div");
      floatMenu.classList.add("float-folder-menu", "hidden");
      const deleteFolderBtn = document.createElement("button");
      deleteFolderBtn.textContent = "Delete";
      floatMenu.appendChild(deleteFolderBtn);
      deleteAllBtn.addEventListener("click", () => {
        chrome.storage.local.get("folders").then((res) => {
          // i need to rerender the folder list (recursion ?)
        });
      });
      burgerEle.parentElement.appendChild(floatMenu);

      burgerEle.addEventListener("click", () => {
        // delete & rename
        document
          .querySelectorAll(".float-folder-menu")
          .forEach((ele) => ele.classList.add("hidden"));

        const fetchedName = burgerEle.parentElement.textContent;

        console.log(burgerEle.nextElementSibling);
        burgerEle.parentElement.children[2].classList.toggle("hidden");
      });
    });
  });
}

renderFolders();
