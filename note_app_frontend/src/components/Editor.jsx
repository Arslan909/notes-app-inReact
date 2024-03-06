import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import "../editor.css";

export default function Editor(props) {
    const [notePadView, setNotePadView] = React.useState(true);

    const [tabs, setTabs] = React.useState([])
    const [EditorData, setEditorData] = React.useState({
        editorTitle: "",
        editorContent: ""
    })

    const [selectedTab, setSelectedTab] = React.useState(null)

    if (tabs.length === 0) {
        newTab()
    }

    React.useEffect(() => {

        if (props.noteId !== null) {
            let updatedTabs = [...tabs]
            updatedTabs.map(tab => {
                if (tab.id === selectedTab) {
                    tab.noteID = props.noteId
                    tab.title = props.noteTitle
                    tab.content = props.noteDescription
                }
                // setSelectedTab(tab.id)

            })
            setTabs(updatedTabs)
        }

    }, [props.noteId])


    function newTab() {
        let newTab = {
            id: tabs.length + 1,
            title: "New Tab",
            content: '',
            noteID: null
        }
        setTabs([...tabs, newTab])
        setSelectedTab(newTab.id)
        props.setNoteId(null)
        props.setSelectedNote(null)

    }

    function handelChange(event) {
        props.setNoteDescription(event.target.value);
    }

    function chnageView() {
        setNotePadView(!notePadView);
    }

    function closeTab(tabId) {
        // setSelectedTab(1)
        const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(updatedTabs);
    }
    console.log(tabs);
    
    React.useEffect(()=>{
    },[tabs])
    console.log(selectedTab);

    const editorTab = tabs.map(tab => (
        <div
            className={tab.id === selectedTab ? 'selected-editor-tab' : 'editor-tab'}
            key={tab.id}
            onClick={() => { setSelectedTab(tab.id) }}>

            <li>{tab.title}</li>
            <button onClick={() => closeTab(tab.id)}> X </button>

        </div>
    ));





    React.useEffect(() => {
        tabs.map(tab => {
            if (tab.id === selectedTab) {
                setEditorData({
                    editorTitle: tab.title,
                    editorContent: tab.content
                })
            }
        })

    }, [selectedTab, props.noteId])


    return (
        <>
            <div className="editor-side-master-container">
                <div className="editor-nav">
                    {editorTab}
                    <button className="new-tab" onClick={() => { newTab() }}>+</button>
                </div>

                <div className="editor-side">
                    <div className="note-pad-head">

                        <h3 className='note-heading'>
                            {EditorData.editorTitle}
                        </h3>


                        <button onClick={chnageView} className='notepad-view-btn'>
                            {notePadView ? <i className='nf nf-oct-book notepad-view-icon'></i> : <i className='nf nf-fa-edit notepad-view-icon'></i>}
                        </button>
                    </div>

                    {EditorData.editorContent !== "" ?
                        <>
                            {notePadView ?
                                <textarea
                                    value={EditorData.editorContent}
                                    className='note-pad-textarea'
                                    onChange={handelChange}
                                    name="note-pad-textarea"
                                ></textarea> :
                                <ReactMarkdown className="note-pad-viewarea">{EditorData.editorContent}</ReactMarkdown>
                            }
                        </> :
                        <div className='note-pad-textarea'><p>create new note</p> <p>open a note</p> </div>
                    }
                </div>
            </div>
        </>
    );
}

Editor.propTypes = {
    noteDescription: PropTypes.string,
    noteTitle: PropTypes.string,
    setNoteDescription: PropTypes.func,
    noteId: PropTypes.number,
    setNoteId: PropTypes.func,
    setSelectedNote: PropTypes.func,
};


// TODO- 
// fix the selected tab when a tab is closed(select the very previous opened tab)
// fix to tab selected at the same this issue(some time color of the both opened tab is like selected tab)
// fix closing of multiple tabs opened
