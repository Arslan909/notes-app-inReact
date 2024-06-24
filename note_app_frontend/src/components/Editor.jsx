import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import "../editor.css";
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, linkPlugin, imagePlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

export default function Editor(props) {
	const [notePadView, setNotePadView] = useState(true);
	const [tabs, setTabs] = useState([]);
	const [selectedTab, setSelectedTab] = useState(null);
	const [editorValue, setEditorValue] = useState("");
	const [updateTimeout, setUpdateTimeout] = useState(null);
	const [saving, setSaving] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);
	const mdxEditorRef = useRef(null);

	React.useEffect(()=>{
		console.log(props.bookmarkedNoteIds);
	},[])
	

	if (tabs.length === 0) {
		newTab();
	}

	useEffect(() => {
		if (props.selectedNoteData != null) {
			let updatedTabs = [...tabs];
			updatedTabs.map(tab => {
				if (tab.id === selectedTab) {
					tab.noteID = props.selectedNoteData.noteId;
					tab.title = props.selectedNoteData.noteName;
					tab.content = props.selectedNoteData.noteDescription;
				}
			});
			setTabs(updatedTabs);
		}
	}, [props.selectedNoteData]);

	useEffect(() => {
		tabs.map(tab => {
			if (tab.id === selectedTab) {
				setEditorValue(tab.content);
				mdxEditorRef.current?.setMarkdown(tab.content);
			}
		});
	}, [selectedTab, tabs]);

	function newTab() {
		let newTab = {
			id: tabs.length + 1,
			title: "New Tab",
			content: "",
			noteID: null
		};
		setTabs([...tabs, newTab]);
		setSelectedTab(newTab.id);
		props.setSelectedNoteData(null);
	}

	function chnageView() {
		setNotePadView(!notePadView);
	}

	// tabs component
	const editorTab = tabs.map(tab => (
		<div
			key={tab.id}
			className={tab.id === selectedTab ? 'selected-editor-tab' : 'editor-tab'}
			onClick={() => { setSelectedTab(tab.id) }}
		>
			<li>{tab.title}</li>
			<button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}> X </button>
		</div>
	));

	function handleChange(updatedMarkdown) {
		const noteContent = updatedMarkdown || mdxEditorRef.current?.getMarkdown();
		let noteID = null;
		let noteTitle = noteContent.split('\n')[0].replace(/^[# ]+/, '') || "Untitled";

		tabs.forEach(tab => {
			if (tab.id === selectedTab) {
				tab.content = noteContent;
				setEditorValue(noteContent);
				noteID = tab.noteID;
				tab.title = noteTitle;
			}
		});

		if (!noteID || !noteContent) {
			console.error('Error: Missing noteId or noteContent');
			return;
		}

		const data = {
			noteId: noteID,
			noteContent: noteContent,
			note_Title: noteTitle
		};

		setSaving(true);
		if (updateTimeout) {
			clearTimeout(updateTimeout);
		}

		const newTimeout = setTimeout(() => {
			axios.post('http://127.0.0.1:5000/updateNoteDescription', data,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				})
				.then(res => {
					console.log(res.data.message);
					if (res.statusText === "OK") {
						setSaving(false);
						props.setRefreshNoteData(prev => !prev);
					}
				})
				.catch(error => {
					console.error('Error:', error);
				});
		}, 1000);

		setUpdateTimeout(newTimeout);
	}

	function closeTab(tabId) {
		const updatedTabs = tabs.filter(tab => tab.id !== tabId);
		let deletedTabIndex = tabs.findIndex(tab => tab.id === tabId);
		let temp = selectedTab;

		if (deletedTabIndex > 0 && updatedTabs.length > 0) {
			temp = updatedTabs[deletedTabIndex - 1].id;
		} else if (updatedTabs.length > 0 && deletedTabIndex == 0) {
			temp = updatedTabs[0].id;
		}
		setTabs(updatedTabs);
		setSelectedTab(temp);
		console.log(props.selectedNoteData);
		// props.setSelectedNoteData(null);

	}

	const token = localStorage.getItem("access_token");
	function addBookmark(noteId) {
		axios.post('http://127.0.0.1:5000/addBookmark',
			{ noteId },
			{
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}
		)
			.then(res => {
				console.log(res.data.message);
				if (res.status === 200) {
					setBookmarked(true);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	function removeBookmark(noteId) {
		axios.post('http://127.0.0.1:5000/removeBookmark',
			{ noteId },
			{
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}
		)
			.then(res => {
				console.log(res.data.message);
				if (res.status === 200) {
					setBookmarked(false);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	useEffect(() => { //custom editor shite! i am not proud of it
		function handleKeyDown(event) {
			if (event.key === 'Enter' && event.shiftKey) {
				event.preventDefault();
				// mdxEditorRef.current.insertMarkdown("\n ");
				mdxEditorRef.current.insertMarkdown("  ");
				// mdxEditorRef.current.insertMarkdown("\n");
				console.log("shitf inserted");

			} else if (event.key === 'Enter') {
				event.preventDefault();
				handleGetMarkdown()
				console.log("inserted");
				mdxEditorRef.current.insertMarkdown("\n");
			}
		}
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	function handleSetMarkdown() {
		mdxEditorRef.current?.setMarkdown("");
		if (mdxEditorRef.current) {
			mdxEditorRef.current.focus(null, { defaultSelection: "rootStart" });
		}
	}

	function handleGetMarkdown() {
		const currentMarkdown = mdxEditorRef.current?.getMarkdown();
		if (currentMarkdown) {
			const updatedMarkdown = currentMarkdown.replace(/\\/g, '');
			handleSetMarkdown()
			handleInsertMarkdown(updatedMarkdown)

		}
	}

	function handleInsertMarkdown(content) {
		mdxEditorRef.current.insertMarkdown(content);
		if (mdxEditorRef.current) {
			mdxEditorRef.current.focus(null, { defaultSelection: "rootEnd" });
		}
	}

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

									<Tooltip title={notePadView ? "view mode" : "edit mode"}>
										<button onClick={chnageView} className='notepad-view-btn'>
											{notePadView
												? <i className='nf nf-oct-book notepad-view-icon'></i>
												: <i className='nf nf-fa-edit notepad-view-icon'></i>}
										</button>
									</Tooltip>

									<Tooltip title={bookmarked ? "Remove Bookmark" : "Add Bookmark"}>
										<i className={bookmarked && props.bookmarkedNoteIds.includes(props.selectedNoteData.noteId) ? "nf nf-oct-bookmark_fill" : "nf nf-oct-bookmark"}
											onClick={() => { bookmarked ? removeBookmark(props.selectedNoteData.noteId) : addBookmark(props.selectedNoteData.noteId) }}>
										</i>
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
							<MDXEditor
								ref={mdxEditorRef}
								markdown={editorValue}
								plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), linkPlugin(), imagePlugin()]}
								className="note-pad-textarea"
								onChange={handleChange}
							/>
							:
							<ReactMarkdown className="note-pad-viewarea" remarkPlugins={[remarkGfm]}>
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
	bookmarkedNoteIds: PropTypes.array,
};
