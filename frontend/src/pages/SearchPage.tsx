import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { VehicleHistory } from '../types';
import { formatDateTime } from '../utils/format';

export function SearchPage() {
  const [data, setData] = useState<VehicleHistory | null>(null);
  const [error, setError] = useState('');

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const registrationNumber = String(form.get('registrationNumber') ?? '');
      const response = await api.get<VehicleHistory>(`/sessions/search?registrationNumber=${encodeURIComponent(registrationNumber)}`);
      setData(response);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h3">Registration Search</Typography>
      <Paper sx={{ p: 3 }}>
        <Stack component="form" direction={{ xs: 'column', md: 'row' }} spacing={2} onSubmit={onSearch}>
          <TextField fullWidth name="registrationNumber" label="Registration Number" />
          <Button variant="contained" type="submit">Search</Button>
        </Stack>
      </Paper>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {data?.sessions.map((session) => (
        <Paper key={session.sessionId} sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h5">{session.branchName} • {session.laneName ?? 'No lane'}</Typography>
            <Typography color="text.secondary">{session.servicePackage} • {session.status}</Typography>
            <Typography variant="body2">Registered {formatDateTime(session.registeredAt)} • Completed {formatDateTime(session.completedAt)}</Typography>
            {session.matsTracking ? <Typography variant="body2">Mats {session.matsTracking.matsRemoved}/{session.matsTracking.matsReinstalled} • {session.matsTracking.conditionNotes}</Typography> : null}
            {session.signature ? <Typography variant="body2">Signature by {session.signature.signedBy} at {formatDateTime(session.signature.signedAt)}</Typography> : null}
            {session.inspection ? <Typography variant="body2">Inspection body {String(session.inspection.bodyCheckPassed)} • interior {String(session.inspection.interiorCheckPassed)}</Typography> : null}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
