import React from 'react';
import {
  alpha,
  Box,
  Button,
  Container,
  Grid2,
  Paper,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { AccessTime, Email } from '@mui/icons-material';
import { customerContact, customerContactLinks } from '../../config/customerContact';

function InstagramIcon() {
  return (
    <SvgIcon>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2A3 3 0 0 0 4 7v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.25A5.75 5.75 0 1 1 6.25 13 5.76 5.76 0 0 1 12 7.25Zm0 2A3.75 3.75 0 1 0 15.75 13 3.75 3.75 0 0 0 12 9.25Zm6.1-3.65a1.35 1.35 0 1 1-1.35 1.35 1.35 1.35 0 0 1 1.35-1.35Z" />
    </SvgIcon>
  );
}

function WhatsAppIcon() {
  return (
    <SvgIcon>
      <path d="M12.04 2a9.91 9.91 0 0 0-8.48 15.03L2 22l5.12-1.5A9.96 9.96 0 1 0 12.04 2Zm0 17.96a8.06 8.06 0 0 1-4.1-1.12l-.29-.17-3.04.89.91-2.97-.19-.31a8.01 8.01 0 1 1 6.71 3.68Zm4.39-6.03c-.24-.12-1.43-.7-1.65-.77-.22-.08-.37-.12-.53.12-.16.23-.61.76-.75.92-.14.16-.28.18-.52.06a6.5 6.5 0 0 1-1.92-1.19 7.17 7.17 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.48.1-.1.24-.27.35-.41.12-.14.16-.23.24-.39.08-.16.04-.29-.02-.41-.06-.12-.53-1.28-.73-1.75-.19-.46-.38-.39-.53-.4h-.45a.86.86 0 0 0-.62.29 2.6 2.6 0 0 0-.81 1.93 4.54 4.54 0 0 0 .95 2.41 10.43 10.43 0 0 0 4.01 3.54 13.47 13.47 0 0 0 1.34.49 3.25 3.25 0 0 0 1.49.09 2.42 2.42 0 0 0 1.59-1.12 1.97 1.97 0 0 0 .14-1.12c-.06-.08-.22-.14-.46-.26Z" />
    </SvgIcon>
  );
}

function TikTokIcon() {
  return (
    <SvgIcon>
      <path d="M14.5 3c.2 1.4 1 2.76 2.18 3.65a5.55 5.55 0 0 0 3.03 1.08v2.72a8.18 8.18 0 0 1-3.3-.7v5.17A6.91 6.91 0 1 1 9.5 8v2.84a4.05 4.05 0 1 0 4.05 4.05V3h.95Z" />
    </SvgIcon>
  );
}

type SocialLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function SocialLink({ href, label, icon }: SocialLinkProps) {
  return (
    <Button
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      startIcon={icon}
      variant="outlined"
      sx={socialButtonSx}
    >
      {label}
    </Button>
  );
}

export const CustomerContactStrip: React.FC = () => {
  return (
    <Box sx={{ pb: { xs: 5, md: 7 } }}>
      <Container maxWidth="xl">
        <Paper sx={contactCardSx}>
          <Grid2 container spacing={3} alignItems="stretch">
            <Grid2 size={{ xs: 12, lg: 4 }}>
              <Stack spacing={1.3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Contact {customerContact.businessName}
                </Typography>
                <Typography sx={{ color: 'text.secondary', maxWidth: 520, lineHeight: 1.7 }}>
                  Reach the team from any customer page with direct contact links, social pages, and operating hours.
                </Typography>
              </Stack>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6, lg: 4 }}>
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box sx={iconBubbleSx}>
                    <Email sx={{ color: '#e36b2c', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Email</Typography>
                    <Typography
                      component="a"
                      href={customerContactLinks.email}
                      sx={{ color: 'text.secondary', textDecoration: 'none' }}
                    >
                      {customerContact.email}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box sx={iconBubbleSx}>
                    <AccessTime sx={{ color: '#e36b2c', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Operating hours</Typography>
                    <Stack spacing={0.35} sx={{ mt: 0.35 }}>
                      {customerContact.operatingHours.map((line) => (
                        <Typography key={line} sx={{ color: 'text.secondary' }}>
                          {line}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6, lg: 4 }}>
              <Stack spacing={1.3}>
                <Typography sx={{ fontWeight: 700 }}>Follow and message us</Typography>
                <Grid2 container spacing={1.25}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <SocialLink href={customerContactLinks.whatsapp} label="WhatsApp" icon={<WhatsAppIcon />} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <SocialLink href={customerContact.instagramUrl} label="Instagram" icon={<InstagramIcon />} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <SocialLink href={customerContact.tiktokUrl} label="TikTok" icon={<TikTokIcon />} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Button
                      component="a"
                      href={customerContactLinks.email}
                      startIcon={<Email />}
                      variant="outlined"
                      sx={socialButtonSx}
                    >
                      Email us
                    </Button>
                  </Grid2>
                </Grid2>
              </Stack>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>
    </Box>
  );
};

const contactCardSx = {
  p: { xs: 2.5, md: 3.25 },
  borderRadius: 5,
  bgcolor: 'rgba(255,247,240,0.09)',
  border: '1px solid rgba(255,248,241,0.18)',
  boxShadow: '0 20px 44px rgba(8, 6, 5, 0.12)',
  backdropFilter: 'blur(12px)',
};

const iconBubbleSx = {
  mt: 0.2,
  width: 34,
  height: 34,
  borderRadius: '50%',
  bgcolor: alpha('#e36b2c', 0.12),
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
};

const socialButtonSx = {
  width: '100%',
  justifyContent: 'flex-start',
  color: '#f5ede5',
  borderColor: 'rgba(255,243,232,0.16)',
  bgcolor: 'rgba(255,247,240,0.06)',
  borderRadius: 999,
  py: 1.15,
  px: 1.8,
  '&:hover': {
    borderColor: 'rgba(255,243,232,0.3)',
    bgcolor: 'rgba(255,247,240,0.1)',
  },
};
