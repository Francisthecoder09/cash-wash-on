import { AccessTime } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { customerSessionConfig } from '../../config/customerSession';

const activityEvents: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export function CustomerSessionTimeoutGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastActivityRef = useRef(Date.now());
  const warnedRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const isPortalLoginPage = location.pathname === '/portal/login';

  useEffect(() => {
    if (isPortalLoginPage) return;

    const markActive = () => {
      lastActivityRef.current = Date.now();
      warnedRef.current = false;
      setSecondsLeft(null);
    };

    activityEvents.forEach((eventName) => window.addEventListener(eventName, markActive, { passive: true }));

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= customerSessionConfig.timeoutMs) {
        window.clearInterval(interval);
        navigate('/portal/login', { replace: true, state: { timeout: true } });
        return;
      }

      if (idleMs >= customerSessionConfig.warningMs) {
        warnedRef.current = true;
        setSecondsLeft(Math.max(1, Math.ceil((customerSessionConfig.timeoutMs - idleMs) / 1000)));
        return;
      }

      if (warnedRef.current) {
        warnedRef.current = false;
        setSecondsLeft(null);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, markActive));
    };
  }, [isPortalLoginPage, navigate]);

  const formattedTime = useMemo(() => {
    if (secondsLeft === null) return null;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [secondsLeft]);

  if (secondsLeft === null || isPortalLoginPage) {
    return null;
  }

  return (
    <Dialog
      open
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(23,18,15,0.98)',
          backgroundImage: 'none',
          border: '1px solid rgba(255,244,233,0.14)',
          borderRadius: 4,
          boxShadow: '0 20px 48px rgba(0,0,0,0.42)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#fff8f1' }}>
        Customer session timing out
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTime sx={{ color: '#e36b2c' }} />
            <Typography sx={{ color: '#fff8f1', fontWeight: 700 }}>
              {formattedTime} remaining
            </Typography>
          </Stack>
          <Typography sx={{ color: 'rgba(255,244,233,0.76)' }}>
            For privacy on shared devices, this customer page will return to customer sign in if there is no activity.
          </Typography>
          <Typography sx={{ color: 'rgba(255,244,233,0.58)', fontSize: '0.84rem' }}>
            Warning at {customerSessionConfig.warningMinutes} min, sign-out at {customerSessionConfig.timeoutMinutes} min.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          variant="contained"
          onClick={() => {
            lastActivityRef.current = Date.now();
            warnedRef.current = false;
            setSecondsLeft(null);
          }}
          sx={{
            bgcolor: '#e36b2c',
            color: '#fffaf5',
            borderRadius: 999,
            '&:hover': { bgcolor: '#cf5d21' },
          }}
        >
          Stay signed in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
