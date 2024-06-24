import React from 'react';
// import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';import Box from '@mui/material/Box';


import "./Css/searchNoteText.css"
import PropTypes from 'prop-types'



export default function SearchNoteText(props) {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const token = localStorage.getItem("access_token")


  const handleClickOpen = async () => {
    setOpen(true)
  };

  const handleClose = () => {
    setOpen(false);
    setSearchText('')
    setSearchResults([])
  };

  function handleOpenNote(noteId){
    props.setSelectedNote(noteId)
    handleClose()
  }

  const handleSearchChange = async (event) => {
    const text = event.target.value;
    setSearchText(text);

    if (text === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/searchFileContent', { "searchQuery": searchText }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setSearchResults(response.data.message)
      console.log(response.data.message)

    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <React.Fragment>
      <Tooltip title="share workspace" placement='right'>
      <ContentPasteSearchOutlinedIcon className="search-icon" onClick={handleClickOpen} />
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
          style: {
            minWidth: "700px",
            borderRadius: "10px", 
            backgroundColor:"#1f1e1f",
            color:"white",
            border:"0.1rem solid #9f9e9f",
            //  marginTop:"-350px"
          },

        }}
      >
        <DialogContent sx={{ paddingLeft: "2px", paddingRight: "2px", color:"white"}}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="email"
            type="search"
            fullWidth
            variant="standard"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Enter Search String"
            InputProps={{
              sx: {
                color:"White",
                padding:"10px"
              },
            }}
            sx={{
              
              '& .MuiInput-underline:before': {
                borderBottom: '1px solid #373736',
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottom: '1px solid #373736',
              },
              '& .MuiInput-underline:after': {
                borderBottom: '1px solid #373736',
              },
            }}
          />

          <List sx={{overflow:"auto"}}>
            {searchResults.length !== 0
              ? searchResults.map((result) => (

                <ListItem key={result.iD} sx={{ padding:"5px" }} onClick={()=>handleOpenNote(result.iD)}>
                  
                  <Box className="matched-text" sx={{ display: 'flex', width: '100%',padding:"9px", marginBottom:"5px", overflow:"hidden",  borderRadius:"5px"}}>
                    <Box sx={{ flex: 1}} >
                      <ListItemText>{result.noteName}</ListItemText>
                    </Box>
                    <Box sx={{ flex: 3, overflow:"hidden" }}>
                      <ListItemText primary={result.noteDescription} />
                    </Box>
                  </Box>

                </ListItem>

              ))
              : null
            }
          </List>

        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}



SearchNoteText.propTypes = {
  setSelectedNote: PropTypes.func
};