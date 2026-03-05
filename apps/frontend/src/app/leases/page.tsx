'use client';

import { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab, Badge } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LeaseList from '@/components/leases/LeaseList';
import ExpiringLeases from '@/components/leases/ExpiringLeases';
import { useQuery } from '@tanstack/react-query';
import { rentalAgreementsApi } from '@/lib/api/leases';

export default function LeasesPage() {
  const [tab, setTab] = useState(0);

  const { data: expiring = [] } = useQuery({
    queryKey: ['expiring-leases', 2],
    queryFn: () => rentalAgreementsApi.getExpiringAgreements(2),
  });

  const urgentCount = expiring.filter((l) => {
    const days = Math.ceil(
      (new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days <= 60;
  }).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, direction: 'rtl' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          חוזי שכירות
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ניהול חוזי שכירות ודיירים
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, direction: 'rtl' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          aria-label="לשוניות חוזים"
        >
          <Tab
            icon={<DescriptionIcon />}
            iconPosition="start"
            label="כל החוזים"
          />
          <Tab
            icon={
              <Badge badgeContent={urgentCount || undefined} color="error">
                <WarningAmberIcon />
              </Badge>
            }
            iconPosition="start"
            label="עומדים לפקוע"
          />
        </Tabs>
      </Box>

      {tab === 0 && <LeaseList />}
      {tab === 1 && <ExpiringLeases />}
    </Container>
  );
}
