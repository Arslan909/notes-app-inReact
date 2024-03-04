import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import "../editor.css";

export default function Editor(props) {
    const [notePadView, setNotePadView] = React.useState(true);
    const [tabs, setTabs] = React.useState([]);

    const [selectedTab, setSelectedTab] = React.useState(null)

    React.useEffect(() => {
        if (tabs.length === 0) {
            newTab()
        }
    }, [])

    React.useEffect(() => {

        if (props.noteId !== null) {
            let updatedTabs = [...tabs]

            updatedTabs.map(tab => {
                if (tab.id === selectedTab) {
                    tab.id = props.noteId
                    tab.title = props.noteTitle
                    tab.content = props.noteDescription
                }
                setSelectedTab(tab.id)
                console.log(`working`);
                console.log(tab);
            })
            setTabs(updatedTabs)
        }

    }, [props.noteId])

    // console.log(selectedTab);
    function newTab() {
        let newTab = {
            id: tabs.length + 1,
            title: "New Tab",
            content: ''
        }
        setTabs([...tabs, newTab])
        setSelectedTab(newTab.id)
        props.setNoteId(null)

    }

    function handelChange(event) {
        props.setNoteDescription(event.target.value);
    }

    function chnageView() {
        setNotePadView(!notePadView);
    }

    function closeTab(tabId) {
        const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(updatedTabs);
    }

    const editorTab = tabs.map(tab => (
        <div className='editor-tab' key={tab.id} onClick={() => { setSelectedTab(tab.id) }}>

            <li>{tab.title}</li>
            <button onClick={() => closeTab(tab.id)}> X </button>

        </div>
    ));


    return (
        <>
            <div className="editor-side-master-container">
                <div className="editor-nav">
                    {editorTab}
                    <button onClick={() => { newTab() }}>+</button>
                </div>

                <div className="editor-side">
                    <div className="note-pad-head">
                        <h3 className='note-heading'>{props.noteTitle}</h3>
                        <button onClick={chnageView} className='notepad-view-btn'>
                            {notePadView ? <i className='nf nf-oct-book notepad-view-icon'></i> : <i className='nf nf-fa-edit notepad-view-icon'></i>}
                        </button>
                    </div>

                    {props.noteDescription !== null ?
                        <>
                            {notePadView ?
                                <textarea
                                    value={props.noteDescription}
                                    className='note-pad-textarea'
                                    onChange={handelChange}
                                    name="note-pad-textarea"
                                ></textarea> :
                                <ReactMarkdown className="note-pad-viewarea">{props.noteDescription}</ReactMarkdown>
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
};


// TODO- 
//check which tab is selected then set the title of selected tab equal tot the selected note
// and render the text of text area according to that title description which will also be set-
// -as content of that tab so we gotta use that content to render text of text area according to selected tab also
