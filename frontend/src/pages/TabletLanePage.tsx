import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid2,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  AssignmentTurnedIn,
  Campaign,
  ContentCopy,
  DirectionsCar,
  East,
  FactCheck,
  Fullscreen,
  FullscreenExit,
  Gesture,
  Inventory2,
  LocalCarWash,
  Phone,
  PlaylistAddCheckCircle,
  Queue,
  TaskAlt,
  VerifiedUser,
} from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { SignaturePad } from '../components/tablet/SignaturePad';
import { SessionStatusChip } from '../components/layout/SessionStatusChip';
import { authStore } from '../store/auth';
import { SelectOption, SessionStatus, VehicleSession } from '../types';
import { formatDateTime, formatDurationMinutes } from '../utils/format';

type TabletAction = 'START_WASH' | 'RECORD_MATS' | 'CAPTURE_SIGNATURE' | 'INSPECT' | 'COMPLETE';

type ChecklistState = {
  vehicleConfirmed: boolean;
  customerConfirmed: boolean;
  valuablesChecked: boolean;
  matsHandled: boolean;
};

const CHECKLIST_KEY = 'lane-tablet-checklist';
const NOTE_KEY = 'lane-tablet-note';

const stepLabels: SessionStatus[] = ['REGISTERED', 'WASHING', 'INTERIOR', 'INSPECTION', 'COMPLETED'];

const actionMeta: Record<TabletAction, { label: string; caption: string; icon: React.ReactNode; tone: string }> = {
  START_WASH: {
    label: 'Start Wash',
    caption: 'Assign lane and begin the wash cycle.',
    icon: <LocalCarWash />,
    tone: '#0ea5e9',
  },
  RECORD_MATS: {
    label: 'Record Mats',
    caption: 'Confirm mats were removed, cleaned, and restored.',
    icon: <Inventory2 />,
    tone: '#f59e0b',
  },
  CAPTURE_SIGNATURE: {
    label: 'Capture Signature',
    caption: 'Save customer approval before final inspection.',
    icon: <Gesture />,
    tone: '#8b5cf6',
  },
  INSPECT: {
    label: 'Run Inspection',
    caption: 'Approve body and interior quality for handoff.',
    icon: <FactCheck />,
    tone: '#22c55e',
  },
  COMPLETE: {
    label: 'Complete Session',
    caption: 'Close the job and release the vehicle.',
    icon: <TaskAlt />,
    tone: '#06b6d4',
  },
};

const defaultChecklist: ChecklistState = {
  vehicleConfirmed: false,
  customerConfirmed: false,
  valuablesChecked: false,
  matsHandled: false,
};

function getChecklistStore(): Record<string, ChecklistState> {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '{}') as Record<string, ChecklistState>;
  } catch {
    return {};
  }
}

function saveChecklist(sessionId: number, checklist: ChecklistState) {
  const current = getChecklistStore();
  current[String(sessionId)] = checklist;
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(current));
}

function getNotesStore(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(NOTE_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function saveNotes(sessionId: number, value: string) {
  const current = getNotesStore();
  current[String(sessionId)] = value;
  localStorage.setItem(NOTE_KEY, JSON.stringify(current));
}

function getNextAction(status?: SessionStatus): TabletAction | null {
  switch (status) {
    case 'REGISTERED':
      return 'START_WASH';
    case 'WASHING':
      return 'RECORD_MATS';
    case 'INTERIOR':
      return 'CAPTURE_SIGNATURE';
    case 'INSPECTION':
      return 'COMPLETE';
    default:
      return null;
  }
}

export function TabletLanePage() {
  const auth = authStore.get();
  const [searchParams] = useSearchParams();
  const requestedSessionId = Number(searchParams.get('sessionId') ?? 0);

  const [sessions, setSessions] = useState<VehicleSession[]>([]);
  const [staff, setStaff] = useState<SelectOption[]>([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [inspectorId, setInspectorId] = useState<number | ''>('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(requestedSessionId || null);
  const [status, setStatus] = useState('Lane tablet synced and ready.');
  const [operatorNote, setOperatorNote] = useState('');
  const [checklist, setChecklist] = useState<ChecklistState>(defaultChecklist);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [, setTick] = useState(0);

  const load = () => api.get<VehicleSession[]>(`/sessions?branchId=${auth?.branchId}`).then(setSessions);

  useEffect(() => {
    load();
    api.get<SelectOption[]>(`/reference/branches/${auth?.branchId}/staff`).then((response) => {
      setStaff(response);
      setInspectorId((current) => current || response[0]?.id || '');
    });
  }, [auth?.branchId]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const activeQueue = useMemo(
    () => sessions.filter((session) => session.status !== 'COMPLETED'),
    [sessions]
  );

  const activeSession = useMemo(() => {
    const selected = activeQueue.find((session) => session.id === selectedSessionId);
    if (selected) return selected;
    if (requestedSessionId) {
      const requested = sessions.find((session) => session.id === requestedSessionId);
      if (requested) return requested;
    }
    return activeQueue[0] ?? sessions[0];
  }, [activeQueue, requestedSessionId, selectedSessionId, sessions]);

  useEffect(() => {
    if (!activeSession) return;
    setSelectedSessionId(activeSession.id);

    const storedChecklist = getChecklistStore()[String(activeSession.id)];
    setChecklist(storedChecklist ?? defaultChecklist);
    setOperatorNote(getNotesStore()[String(activeSession.id)] ?? '');
    setSignatureDataUrl('');
  }, [activeSession?.id]);

  const progressValue = activeSession
    ? ((stepLabels.indexOf(activeSession.status) + 1) / stepLabels.length) * 100
    : 0;

  const nextAction = getNextAction(activeSession?.status);
  const elapsedMinutes = activeSession
    ? Math.floor((Date.now() - new Date(activeSession.washingStartedAt ?? activeSession.registeredAt).getTime()) / 60000)
    : 0;
  const isOverdue = elapsedMinutes >= 45 && activeSession?.status !== 'COMPLETED';

  useEffect(() => {
    if (!isOverdue || !soundEnabled) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.03;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);

    return () => {
      oscillator.disconnect();
      gain.disconnect();
      context.close().catch(() => undefined);
    };
  }, [isOverdue, soundEnabled, activeSession?.id]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      return;
    }
    await document.exitFullscreen?.();
  };

  const handleChecklistToggle = (key: keyof ChecklistState, value: boolean) => {
    if (!activeSession) return;
    const nextChecklist = { ...checklist, [key]: value };
    setChecklist(nextChecklist);
    saveChecklist(activeSession.id, nextChecklist);
  };

  const handleNoteChange = (value: string) => {
    setOperatorNote(value);
    if (activeSession) {
      saveNotes(activeSession.id, value);
    }
  };

  const runAction = async (action: TabletAction) => {
    if (!activeSession) return;

    if (action === 'START_WASH') {
      await api.post(`/sessions/${activeSession.id}/start-wash`, { laneId: activeSession.laneId, operatorStaffId: auth?.staffId }, true);
    }
    if (action === 'RECORD_MATS') {
      await api.post(`/sessions/${activeSession.id}/record-mats`, {
        matsRemoved: 4,
        matsReinstalled: 4,
        conditionNotes: operatorNote || 'Tablet recorded mat cycle',
      }, true);
      handleChecklistToggle('matsHandled', true);
    }
    if (action === 'CAPTURE_SIGNATURE') {
      if (!signatureDataUrl) {
        setStatus('Add a signature before saving approval.');
        return;
      }
      await api.post(`/sessions/${activeSession.id}/capture-signature`, {
        signedBy: activeSession.customerName,
        signatureDataUrl,
      }, true);
    }
    if (action === 'INSPECT') {
      await api.post(`/sessions/${activeSession.id}/inspect`, {
        inspectorStaffId: inspectorId,
        bodyCheckPassed: true,
        interiorCheckPassed: true,
        notes: operatorNote || 'Tablet inspection passed',
      }, true);
    }
    if (action === 'COMPLETE') {
      await api.post(`/sessions/${activeSession.id}/complete`, {}, true);
    }

    setStatus(`${actionMeta[action].label} completed for ${activeSession.registrationNumber}.`);
    await load();
  };

  const quickActions = (Object.keys(actionMeta) as TabletAction[]).map((action) => {
    const isRecommended = action === nextAction;
    const disabled =
      !activeSession ||
      (action === 'START_WASH' && activeSession.status !== 'REGISTERED') ||
      (action === 'RECORD_MATS' && activeSession.status !== 'WASHING') ||
      (action === 'CAPTURE_SIGNATURE' && activeSession.status !== 'INTERIOR') ||
      (action === 'INSPECT' && activeSession.status !== 'INTERIOR') ||
      (action === 'COMPLETE' && activeSession.status !== 'INSPECTION');

    return { action, isRecommended, disabled };
  });

  return (
    <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Paper
              sx={{
                p: 3.5,
                borderRadius: 5,
                background:
                  isOverdue
                    ? 'radial-gradient(circle at top left, rgba(239,68,68,0.22), transparent 40%), linear-gradient(180deg, rgba(25,8,8,0.96), rgba(24,11,14,0.92))'
                    : 'radial-gradient(circle at top left, rgba(14,165,233,0.22), transparent 40%), linear-gradient(180deg, rgba(8,15,19,0.96), rgba(11,24,18,0.92))',
                border: isOverdue ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(56,189,248,0.18)',
                boxShadow: isOverdue ? '0 20px 45px rgba(127, 29, 29, 0.35)' : '0 20px 45px rgba(3, 7, 18, 0.35)',
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Box>
                    <Typography variant="overline" sx={{ color: '#7dd3fc', letterSpacing: '0.18em' }}>
                      Lane Tablet
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
                      {activeSession?.registrationNumber ?? 'No active vehicle'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {activeSession ? `${activeSession.customerName} • ${activeSession.servicePackage}` : 'Waiting for a session handoff from the board.'}
                    </Typography>
                  </Box>
                  <Stack spacing={1} alignItems="flex-end">
                    {activeSession && <SessionStatusChip status={activeSession.status} />}
                    <Stack direction="row" spacing={1}>
                      <Chip
                        size="small"
                        icon={<Campaign sx={{ fontSize: 16 }} />}
                        label={soundEnabled ? 'Alerts On' : 'Alerts Off'}
                        onClick={() => setSoundEnabled((value) => !value)}
                        sx={{ cursor: 'pointer' }}
                      />
                      <IconButton onClick={toggleFullscreen} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}>
                        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>

                {isOverdue && (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    This vehicle has been active for {elapsedMinutes} minutes. Prioritize the next action and clear the lane.
                  </Alert>
                )}

                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: 'rgba(148,163,184,0.12)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #0ea5e9, #22c55e)',
                    },
                  }}
                />

                <Grid2 container spacing={1.5}>
                  {stepLabels.map((step) => (
                    <Grid2 key={step} size={stepLabels.length === 5 ? { xs: 6, sm: 4, lg: 6 } : { xs: 12 }}>
                      <Chip
                        label={step.replace('_', ' ')}
                        sx={{
                          width: '100%',
                          justifyContent: 'center',
                          fontWeight: 700,
                          background:
                            activeSession && stepLabels.indexOf(step) <= stepLabels.indexOf(activeSession.status)
                              ? 'rgba(34,197,94,0.14)'
                              : 'rgba(148,163,184,0.10)',
                          color:
                            activeSession && stepLabels.indexOf(step) <= stepLabels.indexOf(activeSession.status)
                              ? '#86efac'
                              : 'rgba(226,232,240,0.78)',
                          border: '1px solid rgba(148,163,184,0.16)',
                        }}
                      />
                    </Grid2>
                  ))}
                </Grid2>

                <Grid2 container spacing={1.5}>
                  <Grid2 size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.04)' }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTime sx={{ color: '#38bdf8', fontSize: 18 }} />
                          <Typography variant="caption" color="text.secondary">Live Timer</Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {activeSession
                            ? formatDurationMinutes(activeSession.washingStartedAt ?? activeSession.registeredAt, activeSession.completedAt)
                            : '--:--'}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid2>
                  <Grid2 size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.04)' }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Queue sx={{ color: '#38bdf8', fontSize: 18 }} />
                          <Typography variant="caption" color="text.secondary">Queue Depth</Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {activeQueue.length}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid2>
                </Grid2>

                {activeSession && (
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DirectionsCar sx={{ color: '#7dd3fc', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        Lane: {activeSession.laneName ?? 'Assign from board'} • Vehicle: {activeSession.vehicleType}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Phone sx={{ color: '#7dd3fc', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        {activeSession.customerPhone || 'No customer phone captured'}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Registered {formatDateTime(activeSession.registeredAt)}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={`GHS ${activeSession.price?.toFixed(2) ?? '0.00'}`} sx={{ fontWeight: 700 }} />
                      {activeSession.portalToken && (
                        <Button
                          startIcon={<ContentCopy />}
                          variant="text"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/portal/${activeSession.portalToken}`);
                            setStatus(`Portal link copied for ${activeSession.registrationNumber}.`);
                          }}
                        >
                          Copy Portal Link
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(12,24,16,0.88)' }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PlaylistAddCheckCircle sx={{ color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Working Checklist
                  </Typography>
                </Stack>
                {[
                  ['vehicleConfirmed', 'Vehicle condition confirmed'],
                  ['customerConfirmed', 'Customer details reconfirmed'],
                  ['valuablesChecked', 'Valuables removed / acknowledged'],
                  ['matsHandled', 'Mats cycle completed'],
                ].map(([key, label]) => (
                  <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{label}</Typography>
                    <Switch
                      checked={checklist[key as keyof ChecklistState]}
                      onChange={(event) => handleChecklistToggle(key as keyof ChecklistState, event.target.checked)}
                    />
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(12,24,16,0.88)' }}>
              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      Recommended Next Step
                    </Typography>
                    <Typography color="text.secondary">
                      Keep operators moving with one clear action at a time.
                    </Typography>
                  </Box>
                  <Alert severity="info" sx={{ minWidth: 260 }}>
                    {status}
                  </Alert>
                </Stack>

                <Grid2 container spacing={2}>
                  {quickActions.map(({ action, isRecommended, disabled }) => (
                    <Grid2 key={action} size={{ xs: 12, md: 6 }}>
                      <Paper
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 4,
                          border: `1px solid ${actionMeta[action].tone}${isRecommended ? '55' : '24'}`,
                          background: isRecommended
                            ? `linear-gradient(135deg, ${actionMeta[action].tone}18, rgba(15,23,42,0.55))`
                            : 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <Stack spacing={1.5} height="100%">
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Box
                                sx={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 3,
                                  display: 'grid',
                                  placeItems: 'center',
                                  background: `${actionMeta[action].tone}20`,
                                  color: actionMeta[action].tone,
                                }}
                              >
                                {actionMeta[action].icon}
                              </Box>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                  {actionMeta[action].label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {actionMeta[action].caption}
                                </Typography>
                              </Box>
                            </Stack>
                            {isRecommended && <Chip label="Recommended" color="info" />}
                          </Stack>
                          <Box sx={{ flex: 1 }} />
                          <Button
                            fullWidth
                            size="large"
                            variant={isRecommended ? 'contained' : 'outlined'}
                            endIcon={<East />}
                            disabled={disabled}
                            onClick={() => runAction(action)}
                            sx={{
                              minHeight: 64,
                              fontWeight: 800,
                              borderRadius: 3,
                              background: isRecommended ? actionMeta[action].tone : undefined,
                              borderColor: `${actionMeta[action].tone}66`,
                            }}
                          >
                            {actionMeta[action].label}
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid2>
                  ))}
                </Grid2>
              </Stack>
            </Paper>

            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, xl: 7 }}>
                <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(12,24,16,0.88)' }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <VerifiedUser sx={{ color: '#38bdf8' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Quality Controls
                      </Typography>
                    </Stack>

                    <TextField
                      select
                      value={inspectorId}
                      onChange={(event) => setInspectorId(Number(event.target.value))}
                      label="Inspector"
                    >
                      {staff.map((member) => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      multiline
                      minRows={4}
                      label="Operator Note"
                      value={operatorNote}
                      onChange={(event) => handleNoteChange(event.target.value)}
                      placeholder="Add handoff notes, damage alerts, cleaning remarks, or customer requests."
                    />

                    <Divider />

                    <Box>
                      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 800 }}>
                        Customer Signature
                      </Typography>
                      <SignaturePad onChange={setSignatureDataUrl} />
                    </Box>
                  </Stack>
                </Paper>
              </Grid2>

              <Grid2 size={{ xs: 12, xl: 5 }}>
                <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(12,24,16,0.88)' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Queue sx={{ color: '#38bdf8' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Active Lane Queue
                      </Typography>
                    </Stack>
                    {activeQueue.length === 0 ? (
                      <Typography color="text.secondary">
                        No vehicles are active right now. Start a wash from the session board to bring a vehicle here.
                      </Typography>
                    ) : (
                      activeQueue.map((session) => {
                        const isSelected = session.id === activeSession?.id;
                        return (
                          <Paper
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: isSelected ? '1px solid rgba(56,189,248,0.55)' : '1px solid rgba(148,163,184,0.12)',
                              background: isSelected ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'translateX(4px)' },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
                              <Box>
                                <Typography sx={{ fontWeight: 800 }}>
                                  {session.registrationNumber}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {session.customerName} • {session.servicePackage}
                                </Typography>
                              </Box>
                              <Stack spacing={0.75} alignItems="flex-end">
                                <SessionStatusChip status={session.status} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDurationMinutes(session.washingStartedAt ?? session.registeredAt, session.completedAt)}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Paper>
                        );
                      })
                    )}
                  </Stack>
                </Paper>
              </Grid2>
            </Grid2>

            <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(12,24,16,0.88)' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Recommended Working Features Included
                  </Typography>
                  <Typography color="text.secondary">
                    Direct board-to-tablet handoff, live active queue, saved operator checklist, signature station, portal link copy, single recommended next action, fullscreen lane mode, and overdue sound alerts.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip icon={<AssignmentTurnedIn />} label="Touch-first controls" />
                  <Chip icon={<PlaylistAddCheckCircle />} label="Shift checklist" />
                  <Chip icon={<Queue />} label="Queue switching" />
                  <Chip icon={<Fullscreen />} label="Fullscreen mode" />
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
}
