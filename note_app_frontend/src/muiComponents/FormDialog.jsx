import React from 'react';
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
// import IconButton from '@mui/material/IconButton';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';


let people = []

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  const handleClickOpen = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/allUsers')
      people = response.data.users
      // console.log(people)
      setOpen(true)

    } catch (error) {
      console.error('Error:', error);
    }

  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInvite = (invitedPerson) => {
    console.log(invitedPerson)
    let inviationData = {
      "reciever": invitedPerson.userID,
      "privilege": "read_only"
    }

    try {
      axios.post("http://127.0.0.1:5000/sendInvitation", inviationData)
        .then(res => {
          setSearchText("")
          console.log(res.data.message)
        })

    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSearchChange = (event) => {
    const text = event.target.value;
    setSearchText(text);
    const results = people.filter(person => person.userEmail.includes(text));
    // console.log(results);
    setSearchResults(results);
  };

  return (
    <React.Fragment>
      <Tooltip title="share workspace" placement='right'>

        <ShareOutlinedIcon className="share-icon" onClick={handleClickOpen} sx={{ color: "#9f9e9f" }} />
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
            width: "900px"
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
            label="Search People"
            type="search"
            fullWidth
            variant="standard"
            value={searchText}
            onChange={handleSearchChange}
          />
          <List>
            {searchText != "" && searchResults.map((person, index) => (
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
