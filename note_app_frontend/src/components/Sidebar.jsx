// import React from "react"
import PropTypes from 'prop-types';

export default function Sidebar(props) {

    let noteList;
    // console.log(props.noteData);


    if (props.noteData != null) {
        noteList = props.noteData.map((note) => {
            return (
                <div key={note[0]} className='note-cont' tabIndex={0} onClick={() => selectNote(note[0])}>

                    <div  className='note-title-cont'>
                        <li className='note-li'>{note[1]} </li>
                    </div>
                    <button className='note-del-btn' onClick={() => deleteNote(note[0])}><i className='nf nf-md-delete_outline delete-icon'></i></button>

                </div>
            )
        })

    } else {
        noteList = <li>loading</li>
    }


    function selectNote(noteId) {
        props.setSelectedNote(noteId)
    }

    function setNewNote() {
        props.setIsNewNote(true)
    }

    function deleteNote(noteId) {
        fetch("http://127.0.0.1:5000/deleteNote",
            {
                method: 'POST',
                body: JSON.stringify(noteId),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },

            }).then(res => res.json()).then(data => {
                console.log(data)
                props.setRefreshNoteData(true)

            })
    }

    return (
        <div className="side-bar">
            
            <header className="side-bar-options">
                <button className='side-bar-options-btn'>
                    <i className="nf nf-md-file_plus_outline new-note-icon" onClick={setNewNote}></i>

                </button>
                <button className='side-bar-options-btn'>
                    <i className="nf nf-md-folder_multiple_plus_outline new-folder-icon"></i>

                </button>
                <button className='side-bar-options-btn'>
                    <i className="nf nf-md-sort new-folder-icon"></i>

                </button>
                <button className='side-bar-options-btn'>
                    <i className="nf nf-md-arrow_expand new-folder-icon"></i>

                </button>
            </header>

            <div className="notes-list">
                <h3>{noteList}</h3>

            </div>
        </div>

    )
}




Sidebar.propTypes = {
    noteData: PropTypes.array,
    setSelectedNote: PropTypes.func,
    setIsNewNote: PropTypes.func,
    setRefreshNoteData: PropTypes.func,
};