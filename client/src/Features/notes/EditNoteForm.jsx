import { useState, useEffect } from "react";
import { useUpdateNoteMutation, useDeleteNoteMutation } from "./notesApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";

const EditNoteForm = ({ note, users }) => {
  // destructuring form useAuth
  const { isManager, isAdmin } = useAuth();

  // destructuring form useUpdateNoteMutation
  const [updateNote, { isLoading, isSuccess, isError, error }] =
    useUpdateNoteMutation();

  // destructuring form useDeleteNoteMutation
  const [
    deleteNote,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteNoteMutation();

  // navigate to redirect a user
  const navigate = useNavigate();

  // state to hold note values
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [completed, setCompleted] = useState(note.completed);
  const [userId, setUserId] = useState(note.user);

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      // resetting input values
      setTitle("");
      setText("");
      setUserId("");
      // redirecting to notes
      navigate("/dash/notes");
    }
  }, [isSuccess, isDelSuccess, navigate]);

  // handle change functions
  const onTitleChanged = (e) => setTitle(e.target.value);
  const onTextChanged = (e) => setText(e.target.value);
  const onCompletedChanged = (e) => setCompleted((prev) => !prev);
  const onUserIdChanged = (e) => setUserId(e.target.value);

  // canSave function that checks all fields are completed
  const canSave = [title, text, userId].every(Boolean) && !isLoading;

  // onClick handler to save note
  const onSaveNoteClicked = async (e) => {
    if (canSave) {
      await updateNote({ id: note.id, user: userId, title, text, completed });
    }
  };

  // onClick handler to delete note by id
  const onDeleteNoteClicked = async () => {
    await deleteNote({ id: note.id });
  };

  // how to display time and dates
  const created = new Date(note.createdAt).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const updated = new Date(note.updatedAt).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const options = users.map((user) => {
    return (
      <option key={user.id} value={user.id}>
        {" "}
        {user.username}
      </option>
    );
  });

  // dynamic classes
  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const validTitleClass = !title ? "form__input--incomplete" : "";
  const validTextClass = !text ? "form__input--incomplete" : "";

  // error handling
  const errContent = (error?.data?.message || delerror?.data?.message) ?? "";

  // delete Button
  let deleteButton = null;
  if (isManager || isAdmin) {
    deleteButton = (
      <button
        className="icon-button"
        title="Delete"
        onClick={onDeleteNoteClicked}
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    );
  }

  // ui content
  const content = (
    <>
      <p className={errClass}>{errContent}</p>
      <div className="form-wrapper">
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="form__title-row">
            <h2>Edit Note #{note.ticket}</h2>
            <div className="form__action-buttons">
              <button
                className="icon-button"
                title="Save"
                onClick={onSaveNoteClicked}
                disabled={!canSave}
              >
                <FontAwesomeIcon icon={faSave} />
              </button>
              {deleteButton}
            </div>
          </div>
          <label className="form__label" htmlFor="note-title">
            Title:
          </label>
          <input
            className={`form__input ${validTitleClass}`}
            id="note-title"
            name="title"
            type="text"
            autoComplete="off"
            value={title}
            onChange={onTitleChanged}
          />

          <label className="form__label" htmlFor="note-text">
            Text:
          </label>
          <textarea
            className={`form__input form__input--text ${validTextClass}`}
            id="note-text"
            name="text"
            value={text}
            onChange={onTextChanged}
          />
          <div className="form__row">
            <div className="form__divider">
              <label
                className="form__label form__checkbox-container"
                htmlFor="note-completed"
              >
                WORK COMPLETE:
                <input
                  className="form__checkbox"
                  id="note-completed"
                  name="completed"
                  type="checkbox"
                  checked={completed}
                  onChange={onCompletedChanged}
                />
              </label>

              <label
                className="form__label form__checkbox-container"
                htmlFor="note-username"
              >
                ASSIGNED TO:
              </label>
              <select
                id="note-username"
                name="username"
                className="form__select"
                value={userId}
                onChange={onUserIdChanged}
              >
                {options}
              </select>
            </div>
            <div className="form__divider">
              <p className="form__created">
                Created:
                <br />
                {created}
              </p>
              <p className="form__updated">
                Updated:
                <br />
                {updated}
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );

  return content;
};

export default EditNoteForm;
