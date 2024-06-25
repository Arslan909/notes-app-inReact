import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, colors } from '@mui/material';

import "./Css/weeklyPlanner.css";

export default function WeeklyTask() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentTasks, setCurrentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const token = localStorage.getItem('access_token');

  const handleClickOpen = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/getTask', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const tasks = response.data;
      const now = new Date();

      const currentTasks = [];
      const overdueTasks = [];

      tasks.forEach(task => {
        const taskDate = new Date(task.created_at);
        const diffTime = Math.abs(now - taskDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7 && task.status !== 'done') {
          overdueTasks.push(task);
        } else if (task.status !== 'done') {
          currentTasks.push(task);
        }
      });

      setCurrentTasks(currentTasks);
      setOverdueTasks(overdueTasks);
      setOpen(true);

      const reportResponse = await axios.get('http://127.0.0.1:5000/getWeeklyReport', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const reportData = reportResponse.data.completionPercentages.map((percentage, index) => ({
        week: `Week ${index + 1}`,
        percentage
      }));
      setWeeklyReport(reportData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearchChange = event => {
    const text = event.target.value;
    setSearchText(text);
  };

  const addTask = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/addTask',
        {
          taskContent: searchText,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      setSearchText('');
      handleClickOpen();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTask = async taskId => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/deleteTask',
        {
          taskId: taskId,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      handleClickOpen();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markTaskAsDone = async taskId => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/updateTaskStatus',
        {
          taskId: taskId,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      handleClickOpen();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <React.Fragment>
      <Tooltip title="share workspace" placement="right">
        <EventNoteOutlinedIcon className="search-icon" onClick={handleClickOpen} />
      </Tooltip>

      <Dialog
        className='planer-main'
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            minWidth: '1500px', 
            borderRadius: "10px",
            backgroundColor: "#1f1e1f",
            color: "white",
            border: "0.1rem solid #9f9e9f"
          },
        }}
      >
        <div className="left-pane" style={{ flex: 1, padding: '20px', borderRight: '1px solid #373736' }}>
          <DialogTitle sx={{ color: "#885af3", fontWeight: "900" }}>Weekly Planner</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "white", fontWeight: "900" }}>Keep track of your weekly tasks</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="email"
              placeholder="Add task"
              type="search"
              fullWidth
              variant="standard"
              value={searchText}
              onChange={handleSearchChange}
              InputProps={{
                sx: {
                  color: "white",
                  padding: "10px",
                  marginBottom: "5px"
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
            <Button
              variant="contained"
              color="primary"
              onClick={addTask}
              sx={{
                backgroundColor: "#885af3",
                marginBottom: "5px"
              }}
            >Add Task
            </Button>

            <DialogContentText
              sx={{
                color: "white",
                fontWeight: "900"
              }}
            >
              Current Tasks
            </DialogContentText>

            <List>
              {currentTasks.map(task => (
                <ListItem key={task.id}>
                  <ListItemText primary={task.taskContent} />
                  <IconButton edge="end" aria-label="done" onClick={() => markTaskAsDone(task.id)}>
                    <CheckIcon sx={{ color: "#885af3" }} />
                  </IconButton>
                  <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                    <DeleteIcon sx={{ color: "white" }} />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {overdueTasks.length > 0 && (
              <>
                <DialogContentText
                  sx={{
                    color: "#f44336",
                    fontWeight: "900"
                  }}
                >
                  Overdue Tasks
                </DialogContentText>

                <List>
                  {overdueTasks.map(task => (
                    <ListItem key={task.id}>
                      <ListItemText primary={task.taskContent} />
                      <IconButton edge="end" aria-label="done" onClick={() => markTaskAsDone(task.id)}>
                        <CheckIcon sx={{ color: "#885af3" }} />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(task.id)}>
                        <DeleteIcon sx={{ color: "white" }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
        </div>

        <div className="right-pane" style={{ flex: 1, padding: '20px', color:"white" }}>
          <DialogContentText sx={{ color: "white", fontWeight: "900" }}>Weekly Report</DialogContentText>
          {weeklyReport.length !== 0 ?
            <BarChart
              width={650}
              height={400}
              series={[{ data: weeklyReport.map(item => item.percentage) }]}
              xAxis={[
                { 
                  data: weeklyReport.map(item => item.week), 
                  scaleType: 'band',
                  colorMap: {
                    type: 'ordinal',
                    colors: weeklyReport.map(item => {
                      if (item.percentage <= 30) {
                        return 'red'; // Color red if percentage <= 30
                      } else {
                        return 'green'; // Color blue otherwise
                      }
                    })
                  }
                }
              ]}

              yAxis={[{ valueFormatter: value =>` ${value}%` }]}
              // barLabel="value"
              margin={{
                left: 40,
                right: 10,
              }}
            />
            :
            <Typography variant="body2" sx={{ color: "white" }}>No report data available</Typography>
          }
        </div>
      </Dialog>
    </React.Fragment>
  );
}
