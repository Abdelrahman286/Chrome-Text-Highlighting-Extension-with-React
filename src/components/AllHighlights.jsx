import React, { useEffect, useState } from "react";
import { deleteNoteById, deleteNoteFromAllFolders, getAllNotes } from "../db";
import Note from "./Note";
const AllHighlights = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchAllNotes = async () => {
      const fetchedNotes = await getAllNotes();
      setNotes(fetchedNotes);
    };
    fetchAllNotes();
  }, []);

  const handleDeleteNote = async (uuid) => {
    const newNotesList = notes.filter((ele) => {
      return ele[0] !== uuid;
    });
    setNotes(newNotesList);
    await deleteNoteFromAllFolders(uuid);
    await deleteNoteById(uuid);
  };

  const renderedNotes = notes.map((note) => {
    return (
      <Note
        key={note[0]}
        uuid={note[0]}
        data={note[1]}
        onDeleteNote={handleDeleteNote}
      ></Note>
    );
  });
  return <div>{renderedNotes}</div>;
};

export default AllHighlights;
