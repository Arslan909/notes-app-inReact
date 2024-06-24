import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

let people = [];

export default function FormDialog() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [privilege, setPrivilege] = useState('read_only');
  const token = localStorage.getItem("access_token");

  const handleClickOpen = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/allUsers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      people = response.data.users;
      setOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInvite = async (invitedPerson) => {
    const invitationData = {
      "reciever": invitedPerson.userID,
      "privilege": privilege
    };

    try {
      const res = await axios.post("http://127.0.0.1:5000/sendInvitation", invitationData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSearchText("");
      console.log(res.data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearchChange = (event) => {
    const text = event.target.value;
    setSearchText(text);
    const results = people.filter(person => person.userEmail.includes(text));
    setSearchResults(results);
  };

  const handlePrivilegeChange = (event) => {
    setPrivilege(event.target.value);
  };

  return (
    <React.Fragment>
      <Tooltip title="share workspace" placement='right'>
        <ShareOutlinedIcon className="share-icon" onClick={handleClickOpen} />
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
            width: "900px",
            borderRadius: "10px",
            backgroundColor: "#1f1e1f",
            color: "white",
            border: "0.1rem solid #9f9e9f"
          },
        }}
      >
        <DialogTitle>Invite</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Use email to invite other people to your workspace
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="email"
            placeholder="Search People"
            type="search"
            fullWidth
            variant="standard"
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              sx: {
                color: "White",
                padding: "10px"
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
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Privilege</FormLabel>
            <RadioGroup
              aria-label="privilege"
              name="privilege"
              value={privilege}
              onChange={handlePrivilegeChange}
            >
              <FormControlLabel value="read_only" control={<Radio />} label="Read Only" />
              <FormControlLabel value="read_write" control={<Radio />} label="Read and Write" />
            </RadioGroup>
          </FormControl>
          <List>
            {searchText !== "" && searchResults.map((person, index) => (
              <ListItem key={index}>
                <ListItemText primary={person.userEmail} />
                <ListItemSecondaryAction>
                  <Button variant="contained" color="primary" size="small" onClick={() => { handleInvite(person) }} >
                    <PersonAddIcon />
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
