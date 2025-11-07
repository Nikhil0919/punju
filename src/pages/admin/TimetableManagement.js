import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
  ,Select, MenuItem, FormControl
} from '@mui/material';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const STORAGE_KEY = 'local_timetable_entries_v1';

const TimetableManagement = () => {
  const [entries, setEntries] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState({ dayIndex: 0, time: TIME_SLOTS[0] });
  const [form, setForm] = useState({ subject: '', teacher: '', room: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load timetable from storage', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const openAdd = (dayIndex, time) => {
    setSelected({ dayIndex, time });
    setForm({ subject: '', teacher: '', room: '' });
    setDialogOpen(true);
  };

  const saveEntry = () => {
    const entry = {
      id: Date.now().toString(),
      dayIndex: selected.dayIndex,
      startTime: selected.time,
      endTime: nextTime(selected.time),
      subject: form.subject || 'Untitled',
      teacher: form.teacher || '',
      room: form.room || ''
    };
    setEntries(prev => [...prev, entry]);
    setDialogOpen(false);
  };

  const nextTime = (time) => {
    const i = TIME_SLOTS.indexOf(time);
    return i >= 0 && i < TIME_SLOTS.length - 1 ? TIME_SLOTS[i+1] : time;
  };

  const removeEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const findEntry = (dayIndex, time) => entries.find(e => e.dayIndex === dayIndex && e.startTime === time);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>Timetable (Local)</Typography>

      <Paper sx={{ overflowX: 'auto' }}>
        <Grid container>
          <Grid item sx={{ width: 120 }}>
            <Box sx={{ height: 48, p: 1, fontWeight: 'bold' }}>Time</Box>
            {TIME_SLOTS.map(t => (
              <Box key={t} sx={{ height: 100, p: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}>{t}</Box>
            ))}
          </Grid>

          {DAYS.map((day, dIdx) => (
            <Grid item key={day} sx={{ minWidth: 180 }}>
              <Box sx={{ height: 48, p: 1, fontWeight: 'bold', textAlign: 'center' }}>{day}</Box>
              {TIME_SLOTS.map(time => {
                const entry = findEntry(dIdx, time);
                return (
                  <Box key={`${day}-${time}`} sx={{ height: 100, p: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    {entry ? (
                      <Paper sx={{ p: 1, backgroundColor: '#3788d8', color: 'white' }}>
                        <Typography variant="subtitle2">{entry.subject}</Typography>
                        <Typography variant="caption">{entry.teacher}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">{entry.startTime} - {entry.endTime}</Typography>
                          <Button size="small" color="inherit" onClick={() => removeEntry(entry.id)}>Delete</Button>
                        </Box>
                      </Paper>
                    ) : (
                      <FormControl fullWidth size="small">
                        <Select
                          displayEmpty
                          value={''}
                          onChange={(e) => {
                            const subject = e.target.value;
                            if (!subject) return;
                            // create entry immediately with selected subject
                            const newEntry = {
                              id: Date.now().toString(),
                              dayIndex: dIdx,
                              startTime: time,
                              endTime: nextTime(time),
                              subject,
                              teacher: '',
                              room: ''
                            };
                            setEntries(prev => [...prev, newEntry]);
                          }}
                          renderValue={(selectedVal) => selectedVal || 'Add...'}
                        >
                          <MenuItem value=""> <em>Add...</em> </MenuItem>
                          <MenuItem value="English">English</MenuItem>
                          <MenuItem value="Science">Science</MenuItem>
                          <MenuItem value="Maths">Maths</MenuItem>
                          <MenuItem value="Physics">Physics</MenuItem>
                          <MenuItem value="Break">Break</MenuItem>
                          <MenuItem value="Lunch">Lunch</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                );
              })}
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Timetable Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 320 }}>
            <TextField label="Subject" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} />
            <TextField label="Teacher" value={form.teacher} onChange={(e) => setForm({...form, teacher: e.target.value})} />
            <TextField label="Room" value={form.room} onChange={(e) => setForm({...form, room: e.target.value})} />
            <Typography variant="caption">{DAYS[selected.dayIndex]} • {selected.time} - {nextTime(selected.time)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEntry}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TimetableManagement;