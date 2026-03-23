import { Chip } from '@mui/material';
import { SessionStatus } from '../../types';
import { statusColors } from '../../utils/constants';

export function SessionStatusChip({ status }: { status: SessionStatus }) {
  return (
    <Chip
      label={status.replace('_', ' ')}
      sx={{
        backgroundColor: `${statusColors[status]}22`,
        color: statusColors[status],
        fontWeight: 700
      }}
    />
  );
}
