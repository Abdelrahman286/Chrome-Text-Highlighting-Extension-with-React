const body = document.querySelector("body");
const modalWrapper = document.querySelector(".modal-wrapper");
function renderModal(content, portal) {
  portal.appendChild(content);
}

//----------- Notes Stuff-------------------
const fetchAllNotesBtn = document.querySelector(".fetch-all-notes");
const deleteAllNotesBtn = document.querySelector(".delete-all-notes");
const notesWrapper = document.querySelector(".notes-wrapper");

async function fetchAllNotes() {
  const data = await chrome.storage.local.get(null);
  // const entries = Object.entries(data)[0][1];
  return data;
}
async function deleteAllNotes() {
  await chrome.storage.local.clear();
}

function renderNote(UUID, data) {
  // Note Div
  const note = document.createElement("div");
  note.classList.add("note");

  // url
  const urlDiv = document.createElement("a");
  urlDiv.textContent = data.url;
  urlDiv.href = data.url;
  urlDiv.target = "_blank";
  urlDiv.classList.add("url");
  note.appendChild(urlDiv);

  // text
  const textDiv = document.createElement("div");
  textDiv.textContent = data.text;
  textDiv.classList.add("noteText");
  note.appendChild(textDiv);

  // note

  const noteDiv = document.createElement("div");
  noteDiv.textContent = data.note;
  console.log(data);
  noteDiv.classList.add("note-content");
  note.appendChild(noteDiv);

  // Delete Action
  const deleteNoteBtn = document.createElement("button");
  deleteNoteBtn.textContent = "Delete Note";
  deleteNoteBtn.addEventListener("click", async () => {
    await chrome.storage.local.remove([UUID]);
    note.remove();
  });
  note.appendChild(deleteNoteBtn);

  // Update note content

  notesWrapper.appendChild(note);
}
deleteAllNotesBtn.addEventListener("click", async () => {
  await deleteAllNotes();
  notesWrapper.innerHTML = "";
});

fetchAllNotesBtn.addEventListener("click", async () => {
  const notes = await fetchAllNotes();
  if (Object.entries(notes).length == 0) return;
  notesWrapper.innerHTML = "";
  Object.entries(notes)
    .sort((a, b) => {
      return b[1].date - a[1].date;
    })
    .forEach((note) => {
      const UUID = note[0];
      const data = note[1];
      // console.log(note);
      renderNote(UUID, data);
    });
});

//---------------- Folders Stuff------------------------------
const folderCount = document.querySelector(".folder-count");
const folderNameIn = document.querySelector(".folder-name-in");
const addFolderBtn = document.querySelector(".add-folder");
const deleteAllFolders = document.querySelector(".delete-all-folders");

addFolderBtn.addEventListener("click", async () => {
  const folders = await chrome.storage.sync.get("Folders");
  // console.log(folders);
  if (Object.entries(folders).length > 0) {
    const newFolder = new Object();
    newFolder.name = folderNameIn.value || "FOLDERRRRRRRR";
    newFolder.content = [];
    const foldersEntries = Object.entries(folders)[0][1];
    const newFoldersList = [...foldersEntries, newFolder];
    await chrome.storage.sync.set({ Folders: newFoldersList });
  }
});

deleteAllFolders.addEventListener("click", async () => {
  await chrome.storage.sync.remove(["Folders"]);
  renderModal(testBtn, modalWrapper);
});

fetchAllNotesBtn.click();

console.log(notesWrapper.outerHTML);
