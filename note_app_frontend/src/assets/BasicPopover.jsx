import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import axios from 'axios';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import Tooltip from '@mui/material/Tooltip';



export default function BasicPopover() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);

  const handleClick = (event) => {
    try {
      axios.post("http://127.0.0.1:5000/notificationAlert")
        .then(res => {
          // console.log(res.data.notifications);
          const temp = res.data.notifications.map((ele, index) => (
            <div className="notification-container" key={index}>
              <span>{ele.senderUsername} sent a workspace share invite</span>
              <Button className='accept-notification' variant="contained" size="small" onClick={() => { handleAccept(ele) }}>✓</Button>
              <Button className='reject-notification' variant="contained" size="small" onClick={() => { handleReject(ele) }}>✗</Button>
              {/* <Button className='reject-notification' variant="contained" size="small" onClick={() => { handleReject(ele) }}>✗</Button> */}
            </div>
          ));
          setNotifications(temp)
        });
    } catch (error) {
      console.error('Error:', error)
    }
    setAnchorEl(event.currentTarget);
  }


  const handleAccept = (arg) => {
    let inviationData = {
      "senderId": arg.senderId
    }

    try {
      axios.post("http://127.0.0.1:5000/acceptInvitation", inviationData)
        .then(res => {
          console.log(res.data.message)
          if (res.status === 200) {
            const updatedNotifications = notifications.filter(notification => notification.senderId !== arg.senderId);
            setNotifications(updatedNotifications);
          }
        })

    } catch (error) {
      console.error('Error:', error)
    }

  }

  const handleReject = (arg) => {
    console.log(arg);
    let inviationData = {
      "senderId": arg.senderId
    };
    console.log(inviationData);

    try {
      axios.post("http://127.0.0.1:5000/rejectInvitation", inviationData)
        .then(res => {
          console.log(res.data.message);
          if (res.status === 200) {
            // Remove the rejected invitation from notifications
            const updatedNotifications = notifications.filter(notification => notification.senderId !== arg.senderId);
            setNotifications(updatedNotifications);
          }
        });

    } catch (error) {
      console.error('Error:', error);
    }
  };



  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Tooltip title="check notifications" placement='right'>
        <NotificationsActiveOutlinedIcon className='notfication-icon' onClick={handleClick} />
      </Tooltip>
      
      {/* <Button aria-describedby={id} variant="contained" onClick={handleClick}>
      </Button> */}
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
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        {notifications.length > 0 ? notifications : <Typography sx={{ p: 2 }}>No notifications</Typography>}
      </Popover>
    </div>
  );
}
