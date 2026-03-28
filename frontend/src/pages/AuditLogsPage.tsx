import {
  Box, Chip, Paper, Skeleton, Stack, Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { authStore } from '../store/auth';
import { HistoryEdu, Login, Logout, Edit, Delete, Add, Visibility } from '@mui/icons-material';

interface AuditLogEntry {
  id: number;
  action: string;
  description: string;
  createdAt: string;
  userId?: number;
  vehicleSessionId?: number;
  metadataJson?: string;
}

const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
  CREATE: { color: '#0ea5e9', icon: <Add sx={{ fontSize: 16 }} />, bg: 'rgba(14,165,233,0.15)' },
  UPDATE: { color: '#3b82f6', icon: <Edit sx={{ fontSize: 16 }} />, bg: 'rgba(59,130,246,0.15)' },
  DELETE: { color: '#ef4444', icon: <Delete sx={{ fontSize: 16 }} />, bg: 'rgba(239,68,68,0.15)' },
  LOGIN: { color: '#f59e0b', icon: <Login sx={{ fontSize: 16 }} />, bg: 'rgba(245,158,11,0.15)' },
  LOGOUT: { color: '#94a3b8', icon: <Logout sx={{ fontSize: 16 }} />, bg: 'rgba(148,163,184,0.15)' },
  VIEW: { color: '#a78bfa', icon: <Visibility sx={{ fontSize: 16 }} />, bg: 'rgba(167,139,250,0.15)' },
};

const getActionConfig = (action: string) => {
  const key = Object.keys(ACTION_CONFIG).find(k => action.toUpperCase().includes(k));
  return ACTION_CONFIG[key ?? ''] ?? { color: '#64748b', icon: <HistoryEdu sx={{ fontSize: 16 }} />, bg: 'rgba(100,116,139,0.15)' };
};

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
    <Stack spacing={4}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2,
              background: 'rgba(100,116,139,0.15)',
              border: '1px solid rgba(100,116,139,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <HistoryEdu />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>Audit Logs</Typography>
            <Typography variant="body2" color="text.secondary">
              Read-only system activity log · Viewing as <strong>{auth?.role}</strong>
            </Typography>
          </Box>
        </Stack>
      </motion.div>

      {/* Timeline */}
      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
              <Skeleton variant="circular" width={36} height={36} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : error ? (
        <Paper sx={{ p: 3, borderColor: '#ef444444', bgcolor: 'rgba(239,68,68,0.08)' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <HistoryEdu sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No audit log entries found.</Typography>
        </Paper>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Vertical timeline line */}
          <Box
            sx={{
              position: 'absolute', left: 17, top: 18, bottom: 18,
              width: 2,
              background: 'linear-gradient(180deg, rgba(14,165,233,0.4) 0%, rgba(100,116,139,0.1) 100%)',
              borderRadius: 999,
            }}
          />
          <Stack spacing={2} sx={{ pl: '52px' }}>
            {logs.map((log, idx) => {
              const cfg = getActionConfig(log.action);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 90, damping: 14 }}
                  style={{ position: 'relative' }}
                >
                  {/* Timeline dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -44, top: 14,
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: cfg.bg,
                      border: `2px solid ${cfg.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cfg.color,
                      zIndex: 1,
                    }}
                  >
                    {cfg.icon}
                  </Box>

                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(12,24,16,0.85)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${cfg.color}18`,
                      transition: 'all 0.25s',
                      '&:hover': {
                        border: `1px solid ${cfg.color}40`,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <Chip
                            label={log.action}
                            size="small"
                            sx={{
                              height: 22, fontSize: '0.68rem', fontWeight: 700,
                              background: cfg.bg, color: cfg.color,
                              border: `1px solid ${cfg.color}40`,
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                          {log.vehicleSessionId && (
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                              Session #{log.vehicleSessionId}
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {log.description}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', pt: 0.25 }}
                      >
                        {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Paper>
                </motion.div>
              );
            })}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
