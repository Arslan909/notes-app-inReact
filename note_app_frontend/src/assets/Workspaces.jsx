import * as React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
// import Button from '@mui/material/Button'
import axios from 'axios'
import PropTypes from 'prop-types'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function Workspaces(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [currentProfile, setCurrentProfile] = React.useState(null);
  const [defaultProfile, setDefaultProfile] = React.useState(null);
  const [teamSpaces, setTeamSpaces] = React.useState([]);
  const token = localStorage.getItem("access_token")

  React.useEffect(() => {
    try {
      axios.get("http://127.0.0.1:5000/getDefaultProfile", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {

          setCurrentProfile(res.data.defaultProfile[0]);
          setDefaultProfile(res.data.defaultProfile[0])
        })
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  // console.log(currentProfile);

  const handleClick = (event) => {
    try {
      axios.get("http://127.0.0.1:5000/getSharedSpaces", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          setTeamSpaces(res.data.sharedProfiles)
        })
    } catch (error) {
      console.error('Error:', error)
    }

    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectProfile = (profile) => {
    let userId = profile.userId
    try {
      axios.post("http://127.0.0.1:5000/shiftWorkspace", { userId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.statusText === "OK") {
            setCurrentProfile(profile)
            if (profile.userId === defaultProfile.userId) {
              props.setSharedFetching(false)

            } else {
              props.setSharedFetching(true)

            }
            props.setRefreshNoteData(prev => !prev)
            handleClose()

            if ("userPrivilege" in profile) {
              props.setPrivilege(profile.userPrivilege)
            } else {
              props.setPrivilege(null)
            }

          }
          console.log(res.data.message)

        })
    } catch (error) {
      console.error('Error:', error)
    }

  }

  const leaveWorkspace = (event, profile) => {
    event.stopPropagation(); 
    console.log(profile);
    const profileData = {
      "userId": profile.userId
    };

    fetch("http://127.0.0.1:5000/leaveWorkspace", {
      method: "POST",
      body: JSON.stringify(profileData),
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        handleClose();
        props.setPrivilege(null);
        handleSelectProfile(defaultProfile)
        console.log("burrrrrrrr");
        return res.json();
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      {/* <Button aria-describedby={id} variant="contained" onClick={handleClick}>
      </Button> */}
      <button className='workspaceBtn' onClick={handleClick}>
        {currentProfile ? `Current Workspace: ${currentProfile.userEmail}` : "Loading..."}

      </button>
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
        {teamSpaces.length > 0 ? (
          <div style={{ backgroundColor: " #323232" }}>

            <div className="notification-container" >
              <Typography onClick={() => { handleSelectProfile(defaultProfile) }}>Workspace {defaultProfile.userEmail}</Typography>
              <span>{(defaultProfile.userEmail === currentProfile.userEmail ? "✓" : "")}</span>
            </div>

            {teamSpaces.map((profile, index) => (
              <div className="notification-container" key={index}>
                <Typography onClick={() => { handleSelectProfile(profile) }} >Workspace {profile.userEmail}</Typography>
                <span>{(profile.userEmail === currentProfile.userEmail ? "✓" : "")}</span>

                <ExitToAppIcon onClick={(event) => { leaveWorkspace(event, profile) }} sx={{ color: "#dbdbda" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="notification-container">
            {defaultProfile ? `Workspace ${defaultProfile.userEmail}` : "Loading..."}
          </div>

        )}
      </Popover>
    </div>
  );
}


Workspaces.propTypes = {
  setRefreshNoteData: PropTypes.func,
  setSharedFetching: PropTypes.func,
  setPrivilege: PropTypes.func
};