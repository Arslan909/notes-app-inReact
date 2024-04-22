import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import "../editor.css";
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';


export default function Editor(props) {
	const [notePadView, setNotePadView] = React.useState(true);

	const [tabs, setTabs] = React.useState([])
	const [selectedTab, setSelectedTab] = React.useState(null)
	const [editorValue, setEditorValue] = React.useState("")
	const [updateTimeout, setUpdateTimeout] = React.useState(null)
	const [saving, setSaving] = React.useState(false)


	if (tabs.length === 0) {
		newTab()
	}

	React.useEffect(() => {
		if (props.selectedNoteData != null) {
			let updatedTabs = [...tabs]
			updatedTabs.map(tab => {
				if (tab.id === selectedTab) {
					tab.noteID = props.selectedNoteData.noteId
					tab.title = props.selectedNoteData.noteName
					tab.content = props.selectedNoteData.noteDescription
				}
			})
			setTabs(updatedTabs)

		}
	}, [props.selectedNoteData])

	// React.useEffect(() => {
	// 	console.log("selected tab is " + selectedTab);
	// 	tabs.map(ele => {
	// 		if (ele.id === selectedTab) {
	// 			console.log("selected tab content id is " + ele.content)
	// 		}
	// 	})
	// 	console.log(props.selectedNoteData);

	// }, [selectedTab, props.selectedNoteData])


	function newTab() {
		let newTab = {
			id: tabs.length + 1,
			title: "New Tab",
			content: "",
			noteID: null
		}
		setTabs([...tabs, newTab])
		setSelectedTab(newTab.id)
		props.setSelectedNoteData(null)

	}

	function chnageView() {
		setNotePadView(!notePadView);
	}

	// function closeTab(tabId) {
	//     // setSelectedTab(1)
	//     const updatedTabs = tabs.filter(tab => tab.id !== tabId);
	//     setTabs(updatedTabs);
	// }
	// // console.log(tabs);

	const editorTab = tabs.map(tab => (
		<div
			key={tab.id}
			className={tab.id === selectedTab ? 'selected-editor-tab' : 'editor-tab'}
			onClick={() => { setSelectedTab(tab.id) }}
		>

			<li>{tab.title}</li>
			<button onClick={() => closeTab(tab.id)}> X </button>
			{/* <button> X </button> */}

		</div>
	))

	React.useEffect(() => {
		tabs.map(tab => {
			if (tab.id === selectedTab) {
				setEditorValue(tab.content)
			}
		})
	}, [selectedTab, tabs])

	function handelChange(event) {
		const noteContent = event.target.value;
		let noteID = null;
		tabs.forEach(tab => {
			if (tab.id === selectedTab) {
				tab.content = noteContent;
				setEditorValue(noteContent);
				noteID = tab.noteID;
			}
		});

		if (!noteID || !noteContent) {
			console.error('Error: Missing noteId or noteContent');
			return;
		}

		const data = {
			noteId: noteID,
			noteContent: noteContent
		}

		setSaving(true)
		if (updateTimeout) {
			clearTimeout(updateTimeout)
		}

		const newTimeout = setTimeout(() => {
			axios.post('http://127.0.0.1:5000/updateNoteDescription', data)
				.then(res => {
					console.log(res.data.message);
					if (res.statusText === "OK") {
						setSaving(false)
						props.setRefreshNoteData(prev => !prev)
					}
				})
				.catch(error => {
					console.error('Error:', error)
				})
		}, 1000)

		setUpdateTimeout(newTimeout)
	}

	function closeTab(tabId) {
		const updatedTabs = tabs.filter(tab => tab.id !== tabId)
		let deletedTabIndex = tabs.findIndex(tab => tab.id === tabId)
		console.log(deletedTabIndex)
		let temp = selectedTab

		if(deletedTabIndex > 0 && updatedTabs.length > 0){
			temp = updatedTabs[deletedTabIndex -1].id
			console.log(temp);
		}else if(updatedTabs.length > 0 &&deletedTabIndex == 0){
			temp = updatedTabs[0].id
			console.log(temp)
		}
		setTabs(updatedTabs)
		setSelectedTab(temp)
		console.log(selectedTab)
	}
	console.log(selectedTab)

	return (
		<div className="editor-side-master-container">
			<div className="editor-nav">
				{editorTab}
				<button className="new-tab" onClick={() => { newTab() }}>+</button>
			</div>

			<div className="editor-side">

				<div className="note-pad-head">

					<h3 className='note-heading'>
						{tabs.length !== 0
							? tabs.map(ele => ele.id === selectedTab ? ele.title : null)
							: null
						}
					</h3>

					<div className="heading-control">
						{
							props.selectedNoteData
								? (<>
									<Tooltip title={saving ? "saving" : "saved"}>
										<i className={saving ? "nf nf-md-database_sync_outline" : "nf nf-md-database_check_outline"}> </i>
									</Tooltip>

									<Tooltip title="view mode">

										<button onClick={chnageView} className='notepad-view-btn'>
											{notePadView
												? <i className='nf nf-oct-book notepad-view-icon'></i>
												: <i className='nf nf-fa-edit notepad-view-icon'></i>}
										</button>
									</Tooltip>

								</>)
								: null
						}

					</div>

				</div>

				{props.selectedNoteData !== null ?
					<>
						{notePadView
							?
							<textarea
								value={editorValue}
								className='note-pad-textarea'
								onChange={handelChange}
								name="note-pad-textarea"
							></textarea>
							:
							<ReactMarkdown className="note-pad-viewarea" remarkPlugins={[remarkGfm]} >
								{editorValue}
							</ReactMarkdown>
						}
					</>
					:
					<div className='new-tab-display'>
						<p>Create new note</p>
						<p>Open a note</p>
					</div>
				}
			</div>
		</div>

	);
}

Editor.propTypes = {

	selectedNoteData: PropTypes.object,
	setSelectedNoteData: PropTypes.func,
	setRefreshNoteData: PropTypes.func,
};