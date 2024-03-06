import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import './App.css'
import './slider.css'


export default function App() {

	const [noteData, setNoteData] = React.useState(null)
	const [noteDescription, setNoteDescription] = React.useState(null)
	const [noteTitle, setNoteTile] = React.useState(null)
	const [isNewNote, setIsNewNote] = React.useState(false)
	const [refreshNoteData, setRefreshNoteData] = React.useState(false)
	const [selectedNote, setSelectedNote] = React.useState(null)
	const [selectedFolderNote, setSelectedFolderNote] = React.useState(null)

	const [noteId, setNoteId] = React.useState(null)

	const [folders, setFolder] = React.useState([])


	React.useEffect(() => {          // this will fetch all the notes present in the database 
		async function getNotes() {
			const response = await fetch("http://127.0.0.1:5000/getNotes", {
				method: 'POST',
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
				}
			})
			const data = await response.json()

			setNoteData(data.notes);
			setRefreshNoteData(false)

		}
		getNotes()

	}, [isNewNote, refreshNoteData])


	React.useEffect(() => {         //this will set the description State var. to the description of the selected note in the side bar 
		if (selectedNote) {
			noteData.map((note) => {
				if (note[0] === selectedNote) {
					setNoteId(note[0])
					setNoteTile(note[1])
					setNoteDescription(note[2])
				}
			})
		}
		else if (selectedFolderNote) {
			folders.map(folder => {
				folder.folderNotes.map(ele => {
					if (ele.noteId === selectedFolderNote) {
						setNoteId(ele.noteId)
						setNoteTile(ele.noteName)
						setNoteDescription(ele.note)
					}
				})
			})
		}

	}, [selectedNote, noteData, selectedFolderNote])



	React.useEffect(() => {        // this will create a new note and send it to server and update the selected note to this new notes id
		async function newNotes(newNoteData) {
			const response = await fetch("http://127.0.0.1:5000/newNotes", {
				method: 'POST',
				body: JSON.stringify(newNoteData),
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
				},
			})
			const data = await response.json()
			console.log(data)
			setIsNewNote(false)

		}

		if (isNewNote) {
			const newNote = [noteData.length + 1, "new note", "new note test..."]
			newNotes(newNote)
			setSelectedNote(noteData.length + 1)

		}


	}, [isNewNote])
	//todo- fix the new note is creating array not function!




	return (
		<main>
			<Split sizes={[20, 80]} direction="horizontal" className="split">

				<Sidebar
					noteData={noteData}
					setSelectedNote={setSelectedNote}
					setIsNewNote={setIsNewNote}
					setRefreshNoteData={setRefreshNoteData}
					setSelectedFolderNote={setSelectedFolderNote}
					setFolder={setFolder}
					folders={folders}

				/>

				<Editor
					noteDescription={noteDescription}
					setNoteDescription={setNoteDescription}
					noteTitle={noteTitle}
					noteId={noteId}
					setNoteId={setNoteId}
					setSelectedNote={setSelectedNote}
				/>

			</Split>

		</main>
	)
}
