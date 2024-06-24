import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import './slider.css'
import { useNavigate } from 'react-router-dom';

import './App.css'

import FormDialog from "./muiComponents/FormDialog"
import NotificationsCheck from "./assets/BasicPopover"

import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import SearchIcon from '@mui/icons-material/Search';
// import SearchNotes from "./components/SearchNotes"
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import WeeklyTask from "./components/Weeklytask"
import SearchNoteText from "./components/SearchNoteText"

export default function App() {

	const [notes, setNotes] = React.useState([])
	const [folders, setFolder] = React.useState([])
	const [refreshNoteData, setRefreshNoteData] = React.useState(false)
	const [selectedNote, setSelectedNote] = React.useState(null)
	const [selectedNoteData, setSelectedNoteData] = React.useState(null)
	const [bookmarkedNoteIds, setBookmarkedNoteIds] = React.useState([])

	const [search, setSearch] = React.useState(false);

	const navigate = useNavigate();

	React.useEffect(() => {          // this will fetch all the notes present in the database 
		const token = localStorage.getItem("access_token")

		async function getNotes() {
			const response = await fetch("http://127.0.0.1:5000/getNotes", {
				method: 'GET',
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
					'Authorization': `Bearer ${token}`
				}
			})
			const data = await response.json()

			setNotes(data.notes);
			setFolder(data.folders);
			// setRefreshNoteData(false)
		}
		async function getBookmarkedIds() {
			try {
				const response = await fetch("http://127.0.0.1:5000/getBookmarkedId", {
					method: 'GET',
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
						'Authorization': `Bearer ${token}`
					}
				});

				if (response.ok) {
					const data = await response.json();
					console.log(data);
          setBookmarkedNoteIds(data);
				} else {
					console.error('Failed to fetch bookmarked note IDs');
				}
			} catch (error) {
				console.error('Error fetching bookmarked note IDs:', error);
			}
		}


		getNotes()
		getBookmarkedIds();


	}, [])
	console.log(bookmarkedNoteIds);

	React.useEffect(() => {          // this will fetch all the notes present in the database 
		const token = localStorage.getItem("access_token")
		async function getNotes() {
			const response = await fetch("http://127.0.0.1:5000/getNotes", {
				method: 'GET',
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
					'Authorization': `Bearer ${token}`
				}
			})
			const data = await response.json()

			setNotes(data.notes);
			setFolder(data.folders);
			// setRefreshNoteData(false)

		}
		getNotes()

	}, [refreshNoteData])

	React.useEffect(() => {
		// console.log(selectedNote);
		if (selectedNote !== null) {
			notes.map(note => {
				if (note.noteId === selectedNote) {
					// console.log("selected note is " + note.noteId)
					let temp = {
						noteId: note.noteId,
						noteName: note.noteName,
						noteDescription: note.noteDescription
					}
					setSelectedNoteData(temp)
				}
			})
		} else {
			setSelectedNoteData(null)
		}

	}, [selectedNote])


	const [splitSize, setSplitSize] = React.useState([20, 100])

	const toggleSplit = () => {
		setSplitSize(prevSize => (prevSize[0] === 20 ? [0, 120] : [20, 100]))
	}

	const logout = () => {
		localStorage.clear()
		fetch("http://127.0.0.1:5000/logout", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		})
		navigate("/login")
	}


	const fetchBookmarkedNotes = async () => {
		const token = localStorage.getItem("access_token")
		try {
			const response = await fetch(`http://localhost:5000/getBookmarkedNotes`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (!response.ok) {
				throw new Error('Failed to fetch bookmarked notes');
			}
			const data = await response.json();
			console.log(data);
			setNotes(data.notes);
		} catch (error) {
			console.error(error);
		}
	};

	const handleBookmarkClick = () => {
		fetchBookmarkedNotes();
	};



	return (
		<div className="mainDiv">
			<div className="side-controls">

				<div className="toggle-sidebar">
					<Tooltip title="sidebar" placement="right">
						<i
							onClick={toggleSplit}
							className="nf nf-oct-sidebar_expand sidebar-icon"
						></i>

					</Tooltip>
				</div>

				<Tooltip title="bookmark" placement="right">
					<BookmarkBorderOutlinedIcon onClick={() => handleBookmarkClick()} className="bookmark-icon" />
				</Tooltip>

				<Tooltip title="search" placement="right">
					<SearchIcon className="search-icon" onClick={() => { setSearch(prev => !prev) }} />
				</Tooltip>


				<WeeklyTask />
				<SearchNoteText setSelectedNote={setSelectedNote} />

				<FormDialog />
				<NotificationsCheck />
				<Tooltip title="logout" placement="right">
					<LogoutIcon className="logout-icon" onClick={logout} />
				</Tooltip>

			</div>

			<Split sizes={splitSize} direction="horizontal" className="split">

				<Sidebar
					noteData={notes}

					setSelectedNote={setSelectedNote}
					selectedNote={selectedNote}
					setRefreshNoteData={setRefreshNoteData}
					setFolder={setFolder}
					folders={folders}
					splitSize={splitSize}
					search={search}
					setNotes={setNotes}

				/>

				<Editor
					selectedNoteData={selectedNoteData}
					setSelectedNoteData={setSelectedNoteData}
					setRefreshNoteData={setRefreshNoteData}
					bookmarkedNoteIds={bookmarkedNoteIds}
				/>

			</Split>

		</div>
	)
}
