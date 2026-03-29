export const customerSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 1,
      borderRadius: 3,
      bgcolor: 'rgba(23,18,15,0.98)',
      backgroundImage: 'none',
      border: '1px solid rgba(255,244,233,0.14)',
      boxShadow: '0 18px 40px rgba(0,0,0,0.38)',
      '& .MuiMenuItem-root': {
        color: '#f5ede5',
        minHeight: 44,
        '&:hover': {
          bgcolor: 'rgba(227,107,44,0.12)',
        },
        '&.Mui-selected': {
          bgcolor: 'rgba(227,107,44,0.2)',
        },
        '&.Mui-selected:hover': {
          bgcolor: 'rgba(227,107,44,0.28)',
        },
      },
    },
  },
} as const;
