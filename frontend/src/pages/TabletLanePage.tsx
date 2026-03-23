import { Alert, Box, Button, Grid2, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { SignaturePad } from '../components/tablet/SignaturePad';
import { authStore } from '../store/auth';
import { SelectOption, VehicleSession } from '../types';
import { formatDurationMinutes } from '../utils/format';

export function TabletLanePage() {
  const auth = authStore.get();
  const [sessions, setSessions] = useState<VehicleSession[]>([]);
  const [staff, setStaff] = useState<SelectOption[]>([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [inspectorId, setInspectorId] = useState<number | ''>('');
  const [status, setStatus] = useState('Tablet lane ready');
  const [, setTick] = useState(0);

  const activeSession = useMemo(
    () => sessions.find((session) => session.status !== 'COMPLETED') ?? sessions[0],
    [sessions]
  );

  const load = () => api.get<VehicleSession[]>(`/sessions?branchId=${auth?.branchId}`).then(setSessions);

  useEffect(() => {
    load();
    api.get<SelectOption[]>(`/reference/branches/${auth?.branchId}/staff`).then((response) => {
      setStaff(response);
      setInspectorId(response[0]?.id ?? '');
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const runAction = async (action: 'START_WASH' | 'RECORD_MATS' | 'CAPTURE_SIGNATURE' | 'INSPECT' | 'COMPLETE') => {
    if (!activeSession) return;
    if (action === 'START_WASH') {
      await api.post(`/sessions/${activeSession.id}/start-wash`, { laneId: activeSession.laneId, operatorStaffId: auth?.staffId }, true);
    }
    if (action === 'RECORD_MATS') {
      await api.post(`/sessions/${activeSession.id}/record-mats`, { matsRemoved: 4, matsReinstalled: 4, conditionNotes: 'Tablet recorded mat cycle' }, true);
    }
    if (action === 'CAPTURE_SIGNATURE') {
      await api.post(`/sessions/${activeSession.id}/capture-signature`, { signedBy: activeSession.customerName, signatureDataUrl }, true);
    }
    if (action === 'INSPECT') {
      await api.post(`/sessions/${activeSession.id}/inspect`, { inspectorStaffId: inspectorId, bodyCheckPassed: true, interiorCheckPassed: true, notes: 'Tablet inspection passed' }, true);
    }
    if (action === 'COMPLETE') {
      await api.post(`/sessions/${activeSession.id}/complete`, {}, true);
    }
    setStatus(`${action} processed`);
    load();
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
      <Grid2 container spacing={3} sx={{ height: '100%' }}>
        <Grid2 size={{ xs: 12, xl: 4 }}>
          <Paper sx={{ p: 4, height: '100%', background: 'linear-gradient(180deg, rgba(20,184,106,0.16), rgba(15,23,42,0.02))' }}>
            <Stack spacing={3}>
              <Typography variant="h3">Lane Tablet</Typography>
              <Alert severity="info">{status}</Alert>
              {activeSession ? (
                <>
                  <Typography variant="h2">{activeSession.registrationNumber}</Typography>
                  <Typography variant="h5">{activeSession.customerName}</Typography>
                  <Typography variant="body1">{activeSession.servicePackage}</Typography>
                  <Typography variant="h4">{formatDurationMinutes(activeSession.washingStartedAt ?? activeSession.registeredAt, activeSession.completedAt)}</Typography>
                  <Typography variant="body1">Timer updates every second while the page is open.</Typography>
                </>
              ) : (
                <Typography>No active session.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, xl: 8 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Grid2 container spacing={2}>
                {(['START_WASH', 'RECORD_MATS', 'CAPTURE_SIGNATURE', 'INSPECT', 'COMPLETE'] as const).map((action) => (
                  <Grid2 key={action} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Button fullWidth size="large" variant="contained" sx={{ minHeight: 84, fontSize: 22 }} onClick={() => runAction(action)}>
                      {action}
                    </Button>
                  </Grid2>
                ))}
              </Grid2>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h4">Inspector</Typography>
                <TextField
                  select
                  value={inspectorId}
                  onChange={(event) => setInspectorId(Number(event.target.value))}
                  label="Inspector"
                >
                  {staff.map((member) => <MenuItem key={member.id} value={member.id}>{member.label}</MenuItem>)}
                </TextField>
              </Stack>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>Customer Signature</Typography>
              <SignaturePad onChange={setSignatureDataUrl} />
            </Paper>
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
}
