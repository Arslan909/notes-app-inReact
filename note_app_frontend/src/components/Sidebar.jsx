import PropTypes from 'prop-types';
import React from 'react';
import axios from 'axios';

import Workspaces from "../assets/Workspaces"
import SearchNotes from './SearchNotes';
import SortNote from '../assets/SortNote';

export default function Sidebar(props) {
    const [expandFolder, setExpandFolder] = React.useState([])
    const [sharedFetching, setSharedFetching] = React.useState(false)
    const [privilege, setPrivilege] = React.useState(null)

    const [sortType, setSortType] = React.useState(null)

    function sortNotes(notes) {
        if (sortType === "AZ") {
            return notes.slice().sort((a, b) => {
                const nameA = a.noteName.toLowerCase();
                const nameB = b.noteName.toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
        } else if (sortType === "ZA") {
            return notes.slice().sort((a, b) => {
                const nameA = a.noteName.toLowerCase();
                const nameB = b.noteName.toLowerCase();
                if (nameA > nameB) return -1;
                if (nameA < nameB) return 1;
                return 0;
            });
        } else {
            return notes;
        }
    }


    let noteList = []
    // stuff done to make a ntoe in root 
    if (props.noteData != null && props.noteData.length != 0) {
        let tempNoteData = props.noteData.filter(ele => ele.folder_id === null)
        tempNoteData = sortNotes(tempNoteData)

        noteList = tempNoteData.map((note) => {
            if (note.folder_id == null) {
                return (
                    <div key={note.noteId} className='note-cont' tabIndex={0}>

                        <div className='note-title-cont' onClick={() => { props.setSelectedNote(note.noteId) }}>
                            <li className='note-li'>{note.noteName} </li>
                        </div>
                        <button className='note-del-btn' onClick={() => { deleteNote(note.noteId) }}><i className='nf nf-md-delete_outline delete-icon'></i></button>
                    </div>
                )

            }
        })

    } else if (props.noteData.length == 0) {
        noteList = null
    }
    else {
        noteList = <li className='note-cont'>loading...</li>
    }



    let folderList = []
    // stuff done to make a folder and its notes ui
    if (props.folders != null && props.folders.length !== 0) {
        folderList = props.folders.map(folder => {
            let folderNotes = props.noteData.filter(note => note.folder_id === folder.folderId)
            folderNotes= sortNotes(folderNotes)
            return (
                <>
                    <div key={folder.folderId} className='note-cont' tabIndex={0}>
                        <div className='note-title-cont' onClick={() => { toggleFolder(folder.folderId) }}>
                            <li className='note-li'>
                                <span>
                                    {expandFolder.includes(folder.folderId)
                                        ?
                                        <i className='nf nf-cod-chevron_down'></i>
                                        :
                                        <i className='nf nf-cod-chevron_right'></i>
                                    }
                                </span>
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

                    {expandFolder.includes(folder.folderId) &&
                        <ul>
                            {folderNotes.map(note => (

                                <div key={note.noteId} className='note-cont' tabIndex={0} >
                                    <div className='note-title-cont' onClick={() => { props.setSelectedNote(note.noteId) }}>
                                        <li className='note-li'>{note.noteName} </li>
                                    </div>
                                    <button className='note-del-btn' onClick={() => { deleteNote(note.noteId) }}><i className='nf nf-md-delete_outline delete-icon'></i></button>
                                </div>

                            ))}
                        </ul>}
                </>

            )
        })
    } else if (props.folders.length == 0) {
        folderList = null
    }
    else {
        folderList = null
    }


    async function createNewNote() {
        let temp = props.noteData.length+1
        const data = {
            noteName: `New Note ${temp}`,
            noteDescription: "# Tittle",
            folderId: null,
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/newNotes', data);
            console.log(response.data);
            props.setRefreshNoteData(prev => !prev)
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function createFolder() {
        const data = {
            folderName: "untitled",
        };

        try {
            const response = await axios.post('http://127.0.0.1:5000/createFolder', data)
            console.log(response.data)
            props.setRefreshNoteData(prev => !prev)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    function createFolderNote(folderId) {
        let temp = props.noteData.length+1
        const data = {
            noteName: `New Note ${temp}`,
            noteDescription: "# Title",
            folderId: folderId,
        };


        axios.post('http://127.0.0.1:5000/folderNote', data)
            .then(response => {
                console.log(response.data)
                props.setRefreshNoteData(prev => !prev)

            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    function toggleFolder(folderId) {
        if (expandFolder.includes(folderId)) {
            setExpandFolder(expandFolder.filter(id => id !== folderId));
        } else {
            setExpandFolder([...expandFolder, folderId]);
        }
    }

    function deleteNote(noteId) {
        axios.post('http://127.0.0.1:5000/deleteNote', { noteId })
            .then(response => {
                console.log(response.data)
                props.setRefreshNoteData(prev => !prev)
                if (noteId == props.selectedNote) {
                    props.setSelectedNote(null)
                }
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    function deleteFolder(folderId) {

        axios.post('http://127.0.0.1:5000/deleteFolder', { folderId })
            .then(response => {
                console.log(response.data)
                props.setRefreshNoteData(prev => !prev)
                props.setSelectedNote(null)
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    return (
        <>
            <div className="side-bar" style={{ display: props.splitSize[0] === 20 ? 'flex' : 'none' }}>

                <div className="toggle-sidebar">
                    {/* <h4>test</h4> */}
                </div>
                {
                    props.search
                        ? <SearchNotes setNotes={props.setNotes} />
                        : <header className="side-bar-options">
                            <button className='side-bar-options-btn' disabled={privilege === "read_only"} onClick={createNewNote}>
                                <i className="nf nf-md-file_plus_outline new-note-icon" ></i>

                            </button>
                            <button className='side-bar-options-btn' onClick={() => { createFolder() }} disabled={privilege === "read_only"}>
                                <i className="nf nf-md-folder_multiple_plus_outline new-folder-icon"></i>

                            </button>
                            <button className='side-bar-options-btn' disabled={privilege === "read_only"}>
                                {/* <i className="nf nf-md-sort new-folder-icon"></i> */}
                                <SortNote setSortType={setSortType} />

                            </button>
                            <button className='side-bar-options-btn' onClick={() => { setExpandFolder([]) }}>
                                <i className="nf nf-md-arrow_expand new-folder-icon"></i>

                            </button>
                            {/* <button className='side-bar-options-btn'>
                       
                    </button> */}
                        </header>
                }

                <div className="notes-list">
                    {sharedFetching ? <h3>TeamsWorkSpace</h3> : null}
                    <h3>{noteList}</h3>
                    <h3>{folderList}</h3>
                </div>

                <div className="share-controls">
                    {privilege != null
                        ?
                        <h3 className='privilige-alert'>
                            {(privilege === "read_only") ? "read only" : "read and write"}
                        </h3>

                        :
                        <h3></h3>
                    }

                    <Workspaces
                        setRefreshNoteData={props.setRefreshNoteData}
                        setSharedFetching={setSharedFetching}
                        setPrivilege={setPrivilege}
                    />
                </div>

            </div>

        </>

    )
}




Sidebar.propTypes = {
    noteData: PropTypes.array,
    setSelectedNote: PropTypes.func,
    setRefreshNoteData: PropTypes.func,

    folders: PropTypes.array,
    setFolder: PropTypes.func,
    splitSize: PropTypes.array,
    selectedNote: PropTypes.number,

    search: PropTypes.bool,
    setNotes: PropTypes.func,




};