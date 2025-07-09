import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ClientTaskSelector from '../components/ClientTaskSelector';
import TimeTracker from '../components/TimeTracker';
import TimeEntryList from '../components/TimeEntryList';

function MainDashboard() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleSelectClientTask = (client, task) => {
    setSelectedClient(client);
    setSelectedTask(task);
  };

  const handleTimeEntrySaved = () => {
    setRefreshList((prev) => prev + 1);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meu Dashboard Principal
      </Typography>

      <ClientTaskSelector onSelectClientTask={handleSelectClientTask} />

      <TimeTracker
        selectedClient={selectedClient}
        selectedTask={selectedTask}
        onTimeEntrySaved={handleTimeEntrySaved}
      />

      <TimeEntryList refreshTrigger={refreshList} />
    </Box>
  );
}

export default MainDashboard;
