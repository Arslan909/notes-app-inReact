// import React from "react"
import PropTypes from 'prop-types';
import React from 'react';

export default function Sidebar(props) {

    let noteList;

    if (props.noteData != null) {
        noteList = props.noteData.map((note) => {
            return (
                <div key={note[0]} className='note-cont' tabIndex={0} onClick={() => {selectNote(note[0])}}>

                    <div className='note-title-cont'>
                        <li className='note-li'>{note[1]} </li>
                    </div>
                    <button className='note-del-btn' onClick={() => deleteNote(note[0])}><i className='nf nf-md-delete_outline delete-icon'></i></button>
                    setSelected
                </div>
            )
        })

    } else {
        noteList = <li>loading</li>
    }

    // const [folders, setFolder] = React.useState([])
    const [expandFolder, setExpandFolder] = React.useState(false)


    function createFolder() {
        let newFolder = {
            folderId: props.folders.length + 1,
            folderName: "New Folder",
            folderNotes: []
        }

        props.setFolder([...props.folders, newFolder])
    }

    function deleteFolder(folderId) {
        let updateFolder = [...props.folders]
        updateFolder = props.folders.filter(fold => fold.folderId !== folderId)
        props.setFolder(updateFolder)

    }
    function createFolderNote(folderId) {
        let updateFolder = [...props.folders]
        updateFolder.map(fold => {
            let tempLen = 0
            if (fold.folderId === folderId) {
                tempLen = fold.folderNotes.length
                let tempNote = {
                    noteId: tempLen + 1,
                    noteName: `untitled ${tempLen + 1}`,
                    note: "untitled note text...",
                }
                fold.folderNotes.push(tempNote)
            }
        })
        props.setFolder(updateFolder)

    }

    function SelectFolderNote(folderID){
        props.setSelectedFolderNote(folderID)
        props.setSelectedNote(null)

    }

    let folderList = []
    if (props.folders.length !== 0) {
        // console.log(props.folders);
        folderList = props.folders.map((folder) => {
            return (
                <>
                    <div key={folder.folderId} className='note-cont' tabIndex={0}>

                        <div className='note-title-cont'>
                            <li className='note-li'>
                                <span onClick={() => { setExpandFolder(prev => !prev) }}><i className='nf nf-cod-chevron_down'></i> </span>
                                {folder.folderName}
                            </li>
                        </div>
                        <button 
                            className='note-del-btn' 
                            onClick={() => { createFolderNote(folder.folderId) }}>
                            <i className='nf nf-cod-new_file delete-icon' ></i>
                        </button> 
                        <button 
                            className='note-del-btn' 
                            onClick={() => { deleteFolder(folder.folderId) }}>
                            <i className='nf nf-md-delete_outline delete-icon' ></i>
                        </button>

                    </div>
                    {expandFolder && (
                        <ul>
                            {folder.folderNotes.map(note => (
                                <li
                                    key={note.noteId}
                                    onClick={() => { SelectFolderNote(note.noteId) }}
                                >
                                    {note.noteName}
                                </li>
                            ))}
                        </ul>
                    )}
                </>

            )
        })
    } else {
        folderList = null
    }



    function selectNote(noteId) {
        props.setSelectedNote(noteId)
        props.setSelectedFolderNote(null)
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
                <button className='side-bar-options-btn' onClick={() => { createFolder() }}>
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
                <h3>{folderList}</h3>

            </div>
        </div>

    )
}




Sidebar.propTypes = {
    noteData: PropTypes.array,
    setSelectedNote: PropTypes.func,
    setIsNewNote: PropTypes.func,
    setRefreshNoteData: PropTypes.func,
    setSelectedFolderNote: PropTypes.func,

    folders: PropTypes.array,
    setFolder: PropTypes.func,
};