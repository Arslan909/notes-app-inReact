import * as React from 'react';
import PropTypes from 'prop-types';

import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';

export default function SortNote(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
        <i onClick={handleClick}  className="nf nf-md-sort new-folder-icon"></i>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className='sort-note-cont'>
        <Typography onClick={()=>props.setSortType("AZ")} sx={{ p: 2 }}>A-Z</Typography>
        <Typography onClick={()=>props.setSortType("ZA")} sx={{ p: 2 }}>Z-A</Typography>
        <Typography onClick={()=>props.setSortType("null")}  sx={{ p: 2 }}>Default</Typography>
        </div>

      </Popover>
    </div>
  );
}


SortNote.propTypes = {
  setSortType: PropTypes.func,
 




};