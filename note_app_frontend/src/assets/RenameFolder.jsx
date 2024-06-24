import * as React from 'react';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import axios from 'axios';
import PropTypes from 'prop-types';


export default function RenameFolder({ folderId, setRefreshNoteData }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [newFolderName, setNewFolderName] = React.useState('');
  const token = localStorage.getItem("access_token");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = async () => {
    if (!newFolderName.trim()) {
      alert("Folder name cannot be empty");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/renameFolder', {
        folderId,
        folderName: newFolderName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.statusText == "OK") {
        setRefreshNoteData(prev => !prev)
      }

    } catch (error) {
      alert("Error renaming folder: " + error.message);
    }

    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Tooltip title="Rename" placement='right'>
        <button className='rename-Btn' onClick={handleClick}>
          <i className='nf nf-md-pencil_box_outline delete-icon'></i>
        </button>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        

      >
        <div style={{
          padding: 16,
          borderRadius: "10px",
          backgroundColor: "#262727",
          color: "white",
          border: "0.1rem solid #9f9e9f",
        }}>

          <OutlinedInput
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter new folder name"
            fullWidth
            sx={{
              marginBottom: 2,
              borderRadius: "10px",
              backgroundColor: "#262727",
              color: "white",
              border: "0.1rem solid #9f9e9f",

            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleRename}
            sx={{
              backgroundColor: "#885af3"
            }}
          >
            Rename
          </Button>
        </div>
      </Popover>
    </div>
  );
}



RenameFolder.propTypes = {
  folderId: PropTypes.number,
  setRefreshNoteData: PropTypes.func

};