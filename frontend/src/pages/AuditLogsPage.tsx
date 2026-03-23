import { Box, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { authStore } from '../store/auth';

interface AuditLogEntry {
  id: number;
  action: string;
  description: string;
  createdAt: string;
  userId?: number;
  vehicleSessionId?: number;
  metadataJson?: string;
}

export function AuditLogsPage() {
  const auth = authStore.get();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AuditLogEntry[]>(`/audit-logs?branchId=${auth?.branchId}`)
      .then(setLogs)
      .catch(() => setError('Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Audit Logs</Typography>
        <Typography color="text.secondary">Read-only system activity log. Viewing as <strong>{auth?.role}</strong>.</Typography>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <Paper sx={{ overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Session</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No audit log entries found.</TableCell>
                </TableRow>
              ) : logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.id}</TableCell>
                  <TableCell><strong>{log.action}</strong></TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.vehicleSessionId ?? '—'}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
