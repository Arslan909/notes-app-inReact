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
import { Typography } from '@mui/material';

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

      // Fetch the weekly report data
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
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: event => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
          style: {
            minWidth: '700px',
          },
        }}
      >
        <DialogTitle>Weekly Planner</DialogTitle>
        <DialogContent>
          <DialogContentText>Keep track of your weekly tasks</DialogContentText>
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
          />
          <Button onClick={addTask}>Add Task</Button>
          <DialogContentText>Current Tasks</DialogContentText>
          <List>
            {currentTasks.map(task => (
              <ListItem key={task.id}>
                <ListItemText primary={task.taskContent} />
                <IconButton edge="end" aria-label="done" onClick={() => markTaskAsDone(task.id)}>
                  <CheckIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
          {overdueTasks.length > 0 && (
            <>
              <DialogContentText>Overdue Tasks</DialogContentText>
              <List>
                {overdueTasks.map(task => (
                  <ListItem key={task.id}>
                    <ListItemText primary={task.taskContent} />
                    <IconButton edge="end" aria-label="done" onClick={() => markTaskAsDone(task.id)}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          <DialogContentText>Weekly Report</DialogContentText>
          {weeklyReport.length !== 0 ?
            <BarChart
              width={600}
              height={300}
              series={[{ data: weeklyReport.map(item => item.percentage) }]}
              xAxis={[{ data: weeklyReport.map(item => item.week), scaleType: 'band' }]}
            />
            :
            <Typography variant="body2">No report data available</Typography>
          }
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
