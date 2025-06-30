// frontend/src/pages/UserDashboard.js
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ClientTaskSelector from '../components/ClientTaskSelector';
import TimeTracker from '../components/TimeTracker';
import TimeEntryList from '../components/TimeEntryList'; // <<< Import this component

function UserDashboard() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshList, setRefreshList] = useState(0); // <<< State to trigger list refresh

  const handleSelectClientTask = (client, task) => {
    setSelectedClient(client);
    setSelectedTask(task);
  };

  // <<< Function to call when a new time entry is saved
  const handleTimeEntrySaved = () => {
    setRefreshList((prev) => prev + 1); // Increment to force the list to re-fetch
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meu Dashboard
      </Typography>

      <ClientTaskSelector onSelectClientTask={handleSelectClientTask} />

      {/* Pass the callback function to the TimeTracker */}
      <TimeTracker
        selectedClient={selectedClient}
        selectedTask={selectedTask}
        onTimeEntrySaved={handleTimeEntrySaved} // <<< Pass this prop
      />

      {/* Add the time entry list below the TimeTracker */}
      <TimeEntryList refreshTrigger={refreshList} /> {/* <<< Pass the refresh trigger */}
    </Box>
  );
}

export default UserDashboard;