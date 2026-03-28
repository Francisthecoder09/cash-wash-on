import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { VehicleHistory, SelectOption } from '../types';
import { formatDateTime } from '../utils/format';
import { authStore } from '../store/auth';
import { getAdminBranchPreference, saveAdminBranchPreference } from '../utils/adminBranchPreference';

export function SearchPage() {
  const auth = authStore.get();
  const isAdmin = auth?.role === 'ADMIN';
  const [data, setData] = useState<VehicleHistory | null>(null);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isAdmin ? getAdminBranchPreference(auth?.branchId) : String(auth?.branchId ?? ''),
  );

  useEffect(() => {
    api.get<SelectOption[]>('/reference/branches').then(setBranches);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      saveAdminBranchPreference(selectedBranchId);
    }
  }, [isAdmin, selectedBranchId]);

  const filteredSessions = useMemo(() => {
    if (!data) return [];
    if (selectedBranchId === 'ALL') return data.sessions;

    const selectedBranch = branches.find((branch) => String(branch.id) === selectedBranchId);
    const branchLabel = selectedBranch?.label;
    if (!branchLabel) return data.sessions;

    return data.sessions.filter((session) => session.branchName === branchLabel);
  }, [branches, data, selectedBranchId]);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const registrationNumber = String(form.get('registrationNumber') ?? '').trim();
      const response = await api.get<VehicleHistory>(`/sessions/search?registrationNumber=${encodeURIComponent(registrationNumber)}`);
      setData(response);
      setError('');
    } catch (err) {
      setError((err as Error).message);
      setData(null);
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2, maxWidth: 420 }}>
          <TextField
            select
            fullWidth
            label="Viewing Branch"
            value={selectedBranchId}
            onChange={(event) => setSelectedBranchId(event.target.value)}
          >
            {isAdmin && <MenuItem value="ALL">All Branches</MenuItem>}
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={String(branch.id)}>
                {branch.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {data && filteredSessions.length === 0 ? (
        <Alert severity="info">No matching sessions were found for the selected branch view.</Alert>
      ) : null}
      {filteredSessions.map((session) => (
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
