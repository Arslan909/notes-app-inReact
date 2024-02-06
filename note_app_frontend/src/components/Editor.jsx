
import PropTypes from 'prop-types';


export default function Editor(props) {
    return (
        <div className="editor-side">
            <h3>this is note editor</h3>
            {/* {props.noteDescription !==null ? <p>{props.noteDescription}</p> : null} */}
            {props.noteDescription !== null ? (
                <textarea
                    value={props.noteDescription}
                    className='text-area'
                ></textarea>
            ) : null}
        </div>

    )
}


Editor.propTypes = {
    noteDescription: PropTypes.string
  };