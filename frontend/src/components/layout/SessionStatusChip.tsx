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
        fontWeight: 700,
        border: `1px solid ${statusColors[status]}33`,
        maxWidth: '100%',
        '& .MuiChip-label': {
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          lineHeight: 1.1,
        },
      }}
    />
  );
}
