// [1]- get all notes [ [[id],[{data}]]  , [[id],[{data}]] ]
export async function getAllNotes() {
  const notesObj = await chrome.storage.local.get(null);
  const entries = Object.entries(notesObj).sort((a, b) => {
    return b[1].date - a[1].date;
  });
  return entries;
}

// [2]- delete note by UUID
export async function deleteNoteById(uuid) {
  await chrome.storage.local.remove([uuid]);
}

// [3]- Edit note comment
export async function editNoteComment(uuid, comment) {
  const noteObj = await chrome.storage.local.get([uuid]);
  const oldEntries = Object.entries(noteObj)[0][1];
  const newEntries = { ...oldEntries, note: comment };
  await chrome.storage.local.set({ uuid: newEntries });
}

// [4]- get all folders list , it returns the name and content of folder
export async function getAllFoldersList() {
  const list = await chrome.storage.sync.get(["Folders"]);
  if (Object.entries(list).length > 0) {
    return Object.entries(list)[0][1];
  } else {
    return [];
  }
}

// [5]- delete note from all folders
export async function deleteNoteFromAllFolders(uuid) {
  const folderList = await getAllFoldersList();
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

// [6]- Add folder
export async function addFolder(folderName) {
  const oldFoldersList = await getAllFoldersList();
  const newFoldersList = [...oldFoldersList, { name: folderName, content: [] }];
  await chrome.storage.sync.set({ Folders: newFoldersList });
}

// [7]- delete folder by name , delete it's content

export async function deleteFolder(folderName) {
  const folderList = await getAllFoldersList();
  // delete notes in local storage
  let UUIDs = [];
  folderList.forEach((ele) => {
    if (ele.name === folderName) {
      UUIDs = [...ele.content];
    }
  });
  await chrome.storage.local.remove([...UUIDs]);

  // delete the folder
  const newFoldersList = folderList.filter((ele) => {
    return ele.name !== folderName;
  });
  await chrome.storage.sync.set({ Folders: newFoldersList });
}
// [8] - rename folder
export async function renameFolder(oldName, newName) {
  const folderList = await getAllFoldersList();

  const newFoldersList = folderList.map((ele) => {
    if (ele.name == oldName) {
      return {
        name: newName,
        content: ele.content,
      };
    } else {
      return ele;
    }
  });
  await chrome.storage.sync.set({ Folders: newFoldersList });
}

// [9] get folder notes

export async function getFolderNotes(folderName) {
  const folderList = await getAllFoldersList();
  let UUIDs = [];

  folderList.forEach((ele) => {
    if (ele.name == folderName) {
      return (UUIDs = [...ele.content]);
    }
  });
  const notesList = await chrome.storage.local.get([...UUIDs]);
  return Object.entries(notesList).sort((a, b) => {
    return b[1].date - a[1].date;
  });p
}

// [10] move note from folder to another one

export async function moveNoteToFolder(uuid, folderName) {
  await deleteNoteFromAllFolders(uuid);

  const folderList = await getAllFoldersList();
  const newFolders = folderList.map((ele) => {
    if (ele.name === folderName) {
      return {
        name: ele.name,
        content: [...ele.content, uuid],
      };
    } else {
      return ele;
    }
  });

  await chrome.storage.sync.set({ Folders: newFolders });
}

// get highlight colors array
export async function getHighlightColors() {
  const colorsObj = await chrome.storage.sync.get(["HIGHLIGHT_COLORS"]);
  if (Object.entries(colorsObj).length == 0) {
    return [];
  } else {
    return Object.entries(colorsObj)[0][1];
  }
}

export async function getFontColors() {
  const colorsObj = await chrome.storage.sync.get(["FONT_COLORS"]);
  if (Object.entries(colorsObj).length == 0) {
    return [];
  } else {
    return Object.entries(colorsObj)[0][1];
  }
}

export async function getShortcutConfig() {
  const configObj = await chrome.storage.sync.get(["SHORTCUT_CONFIG"]);
  if (Object.entries(configObj).length == 0) {
    return [];
  } else {
    return Object.entries(configObj)[0][1];
  }
}
