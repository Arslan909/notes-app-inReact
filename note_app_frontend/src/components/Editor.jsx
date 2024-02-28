
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import "../editor.css"


export default function Editor(props) {
    const [notePadView, setNotePadView] = React.useState(true)


    function handelChange(event) {
        props.setNoteDescription(event.target.value)

    }

    function chnageView() {
        setNotePadView(notePadView ? false : true)
    }
    console.log(props.noteDescription);
    



    let editorTab = null; 

    if (editorTab === null && props.noteDescription === null) {
        editorTab = (
            <>
            <div className='editor-tab'>
                <li>new tab</li>
                <button onClick={closeTab}> X </button>
            </div>
            </>
        );
    }else{
        editorTab = (
            <>
            <div className='editor-tab'>
                <li>{props.noteTitle}</li>
                <button onClick={closeTab}> X </button>
            </div>
            </>
        );
    }

    function closeTab(){
        editorTab = null
        props.setNoteDescription(null)
    }




    return (
        <>
            <div className="editor-side-master-container">

                <div className="editor-nav">
                    {editorTab}
                    <button>+</button>
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
                            {
                                notePadView
                                    ?
                                    <textarea
                                        value={props.noteDescription}
                                        className='note-pad-textarea'
                                        onChange={handelChange}
                                        name="note-pad-textarea"
                                    ></textarea>
                                    :
                                    <ReactMarkdown className="note-pad-viewarea">{props.noteDescription}</ReactMarkdown>
                            }
                        </>
                        : 
                        <div className='note-pad-textarea'><p>create new note</p> <p>open a note</p> </div>
                    }
                </div>
            </div>
        </>

    )
}


Editor.propTypes = {
    noteDescription: PropTypes.string,
    noteTitle: PropTypes.string,
    setNoteDescription: PropTypes.func
};