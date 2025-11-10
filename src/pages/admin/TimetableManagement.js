import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Dialog, DialogTitle, DialogContent,
  TextField,
  Select, MenuItem, FormControl
} from '@mui/material';
import { getSections, createTimetableEntry } from '../../services/api';
import api from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const STORAGE_KEY = 'local_timetable_entries_v1';

const TimetableManagement = () => {
  const [entries, setEntries] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  // dialog/form removed — using quick-add dropdown and backend persistence
  const [loadError, setLoadError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ subject: '', teacher: '', room: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load timetable from storage', e);
    }
    // try to fetch sections from backend (non-blocking)
    (async () => {
      try {
        const data = await getSections();
        if (Array.isArray(data) && data.length > 0) {
          setSections(data);
          setSelectedSectionId(data[0]._id);
        }
      } catch (err) {
        console.warn('Could not fetch sections from backend:', err.message || err);
        setLoadError('Could not load sections from server. Showing local timetable only.');
      }
    })();
  }, []);

  // fetch timetable entries for selected section from backend when it changes
  useEffect(() => {
    if (!selectedSectionId) return;

    let cancelled = false;
    (async () => {
      try {
        const resp = await api.get(`/timetable/section/${selectedSectionId}`);
        // resp.data expected to be array of timetable entries
        if (!cancelled && Array.isArray(resp.data)) {
          // map server entries to local shape
          const mapped = resp.data.map(e => ({
            id: e._id || Date.now().toString(),
            dayIndex: (e.dayOfWeek || 1) - 1,
            startTime: e.startTime,
            endTime: e.endTime,
            subject: e.subject,
            teacher: e.teacher?.fullName || e.teacher || '',
            room: e.room || '',
            sectionId: e.section?._id || selectedSectionId
          }));
          setEntries(mapped);
        }
      } catch (err) {
        console.warn('Failed to load timetable from server:', err.message || err);
        setLoadError(prev => prev || 'Failed to load timetable from server — using local data.');
        // keep local entries filtered by section
        setEntries(prev => prev.filter(en => (en.sectionId || 'local') === (selectedSectionId || 'local')));
      }
    })();

    return () => { cancelled = true; };
  }, [selectedSectionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // removed dialog-based add flow (we use the dropdown to create entries)

  const nextTime = (time) => {
    const i = TIME_SLOTS.indexOf(time);
    return i >= 0 && i < TIME_SLOTS.length - 1 ? TIME_SLOTS[i+1] : time;
  };

  const removeEntry = async (id) => {
    // Try server delete first, fallback to local removal
    try {
      await api.delete(`/timetable/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.warn('Server delete failed, removing locally:', err.message || err);
      setEntries(prev => prev.filter(e => e.id !== id));
      setLoadError('Could not delete on server; removed locally.');
    }
  };

  const findEntry = (dayIndex, time) => entries.find(e => e.dayIndex === dayIndex && e.startTime === time && (selectedSectionId ? e.sectionId === selectedSectionId : true));

  const openEdit = (entry) => {
    setEditing(entry);
    setEditForm({ subject: entry.subject || '', teacher: entry.teacher || '', room: entry.room || '' });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const updated = { ...editing, ...editForm };
    // update locally
    setEntries(prev => prev.map(e => e.id === editing.id ? { ...e, ...editForm } : e));

    // if server-backed, try to update server
    if (editing.id && editing.id.length === 24) {
      try {
        await api.put(`/timetable/${editing.id}`, {
          section: updated.sectionId,
          teacher: updated.teacher,
          subject: updated.subject,
          dayOfWeek: updated.dayIndex + 1,
          startTime: updated.startTime,
          endTime: updated.endTime,
          room: updated.room
        });
      } catch (err) {
        console.warn('Failed to update on server, saved locally:', err.message || err);
        setLoadError('Failed to update on server; changes saved locally.');
      }
    }

    setEditOpen(false);
    setEditing(null);
  };

  const saveAllForSection = async () => {
    if (!selectedSectionId) {
      setLoadError('Please select a section before saving');
      return;
    }
    setSaving(true);
    try {
      const toSave = entries.filter(e => (e.sectionId || 'local') === selectedSectionId);
      for (const e of toSave) {
        if (!e.id || e.id.length !== 24) {
          // create
          try {
            const resp = await createTimetableEntry({
              sectionId: selectedSectionId,
              teacherId: '',
              subject: e.subject,
              dayOfWeek: e.dayIndex + 1,
              startTime: e.startTime,
              endTime: e.endTime,
              room: e.room
            });
            // resp may contain created entry; update id
            const newId = resp?._id || resp?.id;
            if (newId) {
              setEntries(prev => prev.map(p => p === e ? { ...p, id: newId } : p));
            }
          } catch (err) {
            console.warn('Failed to create entry on server, keeping local:', err.message || err);
            setLoadError(prev => prev || 'Some entries could not be saved to server.');
          }
        } else {
          // update existing on server
          try {
            await api.put(`/timetable/${e.id}`, {
              section: selectedSectionId,
              teacher: e.teacher,
              subject: e.subject,
              dayOfWeek: e.dayIndex + 1,
              startTime: e.startTime,
              endTime: e.endTime,
              room: e.room
            });
          } catch (err) {
            console.warn('Failed to update entry on server:', err.message || err);
            setLoadError(prev => prev || 'Some entries could not be updated on server.');
          }
        }
      }
      // refresh from server
      try {
        const resp = await api.get(`/timetable/section/${selectedSectionId}`);
        if (Array.isArray(resp.data)) {
          const mapped = resp.data.map(e => ({
            id: e._id || Date.now().toString(),
            dayIndex: (e.dayOfWeek || 1) - 1,
            startTime: e.startTime,
            endTime: e.endTime,
            subject: e.subject,
            teacher: e.teacher?.fullName || e.teacher || '',
            room: e.room || '',
            sectionId: e.section?._id || selectedSectionId
          }));
          setEntries(prev => {
            // replace all entries for this section with mapped
            const others = prev.filter(p => (p.sectionId || 'local') !== selectedSectionId);
            return [...others, ...mapped];
          });
        }
      } catch (err) {
        // ignore
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>Timetable (Local)</Typography>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 240 }} size="small">
          <Select
            value={selectedSectionId}
            displayEmpty
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            {sections.length === 0 && <MenuItem value="">Local (no sections)</MenuItem>}
            {sections.map(s => (
              <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={saveAllForSection} disabled={!selectedSectionId || saving}>
          {saving ? 'Saving...' : 'Save Timetable'}
        </Button>
        {loadError && <Typography color="error" variant="caption">{loadError}</Typography>}
      </Box>

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
                      <Paper sx={{ p: 1, backgroundColor: '#3788d8', color: 'white', cursor: 'pointer' }} onClick={() => openEdit(entry)}>
                        <Typography variant="subtitle2">{entry.subject}</Typography>
                        <Typography variant="caption">{entry.teacher}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">{entry.startTime} - {entry.endTime}</Typography>
                          <Button size="small" color="inherit" onClick={(ev) => { ev.stopPropagation(); removeEntry(entry.id); }}>Delete</Button>
                        </Box>
                      </Paper>
                    ) : (
                      <FormControl fullWidth size="small">
                        <Select
                          displayEmpty
                          value={''}
                          onChange={async (e) => {
                            const subject = e.target.value;
                            if (!subject) return;
                            // prepare payload for backend
                            const payload = {
                              sectionId: selectedSectionId || 'local',
                              teacherId: '',
                              subject,
                              dayOfWeek: dIdx + 1,
                              startTime: time,
                              endTime: nextTime(time)
                            };

                            // Try to create on server first. If it fails, fallback to local storage.
                            try {
                              const resp = await createTimetableEntry(payload);
                              // server should return the saved entry; map to local shape
                              const saved = resp || {};
                              const mapped = {
                                id: saved._id || Date.now().toString(),
                                dayIndex: (saved.dayOfWeek || payload.dayOfWeek) - 1,
                                startTime: saved.startTime || payload.startTime,
                                endTime: saved.endTime || payload.endTime,
                                subject: saved.subject || payload.subject,
                                teacher: saved.teacher?.fullName || '',
                                room: saved.room || '',
                                sectionId: saved.section?._id || payload.sectionId
                              };
                              setEntries(prev => [...prev, mapped]);
                            } catch (err) {
                              console.warn('Server create failed, falling back to local:', err.message || err);
                              const newEntry = {
                                id: Date.now().toString(),
                                dayIndex: dIdx,
                                startTime: time,
                                endTime: nextTime(time),
                                subject,
                                teacher: '',
                                room: '',
                                sectionId: selectedSectionId || 'local'
                              };
                              setEntries(prev => [...prev, newEntry]);
                              setLoadError('Could not save to server; entry saved locally.');
                            }
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

      {/* dialog removed — quick-add dropdown used instead */}
      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Timetable Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 320 }}>
            <TextField label="Subject" value={editForm.subject} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} />
            <TextField label="Teacher" value={editForm.teacher} onChange={(e) => setEditForm({...editForm, teacher: e.target.value})} />
            <TextField label="Room" value={editForm.room} onChange={(e) => setEditForm({...editForm, room: e.target.value})} />
          </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default TimetableManagement;