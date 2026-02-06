'use client';

import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import { Login as LoginIcon, Home as HomeIcon } from '@mui/icons-material';
import { AccountSelector } from '@/components/layout/AccountSelector';

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', width: '100%' }}>
          {/* Account Selector */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <AccountSelector />
          </Box>
          
          <HomeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h3" component="h1" gutterBottom>
            מערכת ניהול דירות להשכרה
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Rent Management Application
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            ברוכים הבאים למערכת ניהול נכסים להשכרה
          </Typography>

          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
            >
              התחבר למערכת
            </Button>
          </Stack>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            ניהול נכסים
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/properties"
              variant="outlined"
              size="large"
            >
              נכסים
            </Button>
            <Button
              component={Link}
              href="/units"
              variant="outlined"
              size="large"
            >
              יחידות
            </Button>
          </Stack>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            ניהול דיירים וחוזים
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/tenants"
              variant="outlined"
              size="large"
            >
              דיירים
            </Button>
            <Button
              component={Link}
              href="/leases"
              variant="outlined"
              size="large"
            >
              חוזי שכירות
            </Button>
          </Stack>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            ניהול בעלות ומימון
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/owners"
              variant="outlined"
              size="large"
            >
              בעלים
            </Button>
            <Button
              component={Link}
              href="/mortgages"
              variant="outlined"
              size="large"
            >
              משכנתאות
            </Button>
            <Button
              component={Link}
              href="/bank-accounts"
              variant="outlined"
              size="large"
            >
              חשבונות בנק
            </Button>
            <Button
              component={Link}
              href="/investment-companies"
              variant="outlined"
              size="large"
            >
              חברות השקעה
            </Button>
          </Stack>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            מעקב פיננסי
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/expenses"
              variant="outlined"
              size="large"
            >
              הוצאות
            </Button>
            <Button
              component={Link}
              href="/income"
              variant="outlined"
              size="large"
            >
              הכנסות
            </Button>
          </Stack>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            דוחות וניתוחים
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              size="large"
            >
              דשבורד
            </Button>
          </Stack>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>תכונות:</strong>
              <br />
              • ניהול נכסים, יחידות דיור וחוזי שכירות
              <br />
              • ניהול דיירים ובעלים
              <br />
              • ניהול משכנתאות וחשבונות בנק
              <br />
              • מעקב הוצאות והכנסות
              <br />
              • ניהול חברות השקעה
              <br />
              • דשבורד ואנליטיקה
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
