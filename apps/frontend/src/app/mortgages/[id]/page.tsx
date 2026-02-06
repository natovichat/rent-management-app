'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { mortgagesApi, Mortgage } from '@/lib/api/mortgages';
import MortgageForm from '@/components/mortgages/MortgageForm';
import MortgagePaymentForm from '@/components/mortgages/MortgagePaymentForm';
import MortgagePaymentHistory from '@/components/mortgages/MortgagePaymentHistory';

/**
 * Get status color for mortgage.
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAID_OFF':
      return 'info';
    case 'REFINANCED':
      return 'warning';
    case 'DEFAULTED':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get status label in Hebrew.
 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'PAID_OFF':
      return 'סולק';
    case 'REFINANCED':
      return 'מימון מחדש';
    case 'DEFAULTED':
      return 'ברירת מחדל';
    default:
      return status;
  }
};

export default function MortgageDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { data: mortgage, isLoading } = useQuery({
    queryKey: ['mortgages', id],
    queryFn: () => mortgagesApi.getMortgage(id),
  });

  const { data: balanceData } = useQuery({
    queryKey: ['mortgages', id, 'balance'],
    queryFn: () => mortgagesApi.getRemainingBalance(id),
    enabled: !!mortgage,
  });

  const deleteMutation = useMutation({
    mutationFn: mortgagesApi.deleteMortgage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgages'] });
      router.push('/mortgages');
    },
    onError: (error: any) => {
      const message = error?.response?.status === 409
        ? 'לא ניתן למחוק משכנתא עם תשלומים'
        : 'שגיאה במחיקת משכנתא';
      setSnackbar({ open: true, message, severity: 'error' });
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(id);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['mortgages', id] });
    setEditDialogOpen(false);
    setSnackbar({ open: true, message: 'משכנתא עודכנה בהצלחה', severity: 'success' });
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['mortgages', id] });
    queryClient.invalidateQueries({ queryKey: ['mortgages', id, 'balance'] });
    setPaymentDialogOpen(false);
    setSnackbar({ open: true, message: 'תשלום נרשם בהצלחה', severity: 'success' });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  if (!mortgage) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">משכנתא לא נמצאה</Alert>
      </Box>
    );
  }

  const payments = mortgage.payments || [];

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/mortgages')}
          >
            חזרה לרשימה
          </Button>
          <Typography variant="h4" component="h1">
            פרטי משכנתא
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setPaymentDialogOpen(true)}
          >
            רישום תשלום
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            עריכה
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            מחיקה
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                פרטים כלליים
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    נכס
                  </Typography>
                  <Typography variant="body1">
                    {mortgage.property?.address || '-'}
                    {mortgage.property?.fileNumber && ` (${mortgage.property.fileNumber})`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    בנק
                  </Typography>
                  <Typography variant="body1">{mortgage.bank}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    סכום הלוואה
                  </Typography>
                  <Typography variant="body1">
                    ₪{Number(mortgage.loanAmount).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ריבית
                  </Typography>
                  <Typography variant="body1">
                    {mortgage.interestRate ? `${Number(mortgage.interestRate).toFixed(2)}%` : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    תשלום חודשי
                  </Typography>
                  <Typography variant="body1">
                    {mortgage.monthlyPayment
                      ? `₪${Number(mortgage.monthlyPayment).toLocaleString()}`
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    סטטוס
                  </Typography>
                  <Chip
                    label={getStatusLabel(mortgage.status)}
                    color={getStatusColor(mortgage.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    תאריך התחלה
                  </Typography>
                  <Typography variant="body1">
                    {new Date(mortgage.startDate).toLocaleDateString('he-IL')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    תאריך סיום
                  </Typography>
                  <Typography variant="body1">
                    {mortgage.endDate
                      ? new Date(mortgage.endDate).toLocaleDateString('he-IL')
                      : '-'}
                  </Typography>
                </Grid>
                {mortgage.bankAccount && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      חשבון בנק
                    </Typography>
                    <Typography variant="body1">
                      {mortgage.bankAccount.bankName} - {mortgage.bankAccount.accountNumber}
                    </Typography>
                  </Grid>
                )}
                {mortgage.linkedProperties && mortgage.linkedProperties.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      נכסים משועבדים נוספים
                    </Typography>
                    <Typography variant="body1">
                      {mortgage.linkedProperties.length} נכסים
                    </Typography>
                  </Grid>
                )}
                {mortgage.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      הערות
                    </Typography>
                    <Typography variant="body1">{mortgage.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Balance Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                יתרה נוכחית
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {balanceData && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    יתרה נוכחית
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    ₪{balanceData.remainingBalance.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    סכום הלוואה מקורי
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    ₪{balanceData.loanAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    סך קרן ששולמה
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    ₪{balanceData.totalPrincipalPaid.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    מספר תשלומים
                  </Typography>
                  <Typography variant="body1">
                    {balanceData.totalPayments}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                היסטוריית תשלומים
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <MortgagePaymentHistory payments={payments} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <MortgageForm
        mortgage={mortgage}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Payment Dialog */}
      <MortgagePaymentForm
        mortgageId={id}
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת משכנתא</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המשכנתא?
            <br />
            <strong>{mortgage.bank}</strong> - {mortgage.property?.address}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
