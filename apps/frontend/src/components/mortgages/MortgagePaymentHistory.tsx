'use client';

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { MortgagePayment } from '@/lib/api/mortgages';

interface MortgagePaymentHistoryProps {
  payments: MortgagePayment[];
}

/**
 * Component for displaying mortgage payment history.
 */
export default function MortgagePaymentHistory({
  payments,
}: MortgagePaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          אין תשלומים רשומים
        </Typography>
      </Box>
    );
  }

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPrincipal = 0; // Principal not available in MortgagePayment interface
  const totalInterest = 0; // Interest not available in MortgagePayment interface

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>תאריך תשלום</TableCell>
            <TableCell align="right">סכום</TableCell>
            <TableCell align="right">קרן</TableCell>
            <TableCell align="right">ריבית</TableCell>
            <TableCell>הערות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {new Date(payment.paymentDate).toLocaleDateString('he-IL')}
              </TableCell>
              <TableCell align="right">
                ₪{Number(payment.amount).toLocaleString()}
              </TableCell>
              <TableCell align="right">
                {'-'} {/* Principal not available */}
              </TableCell>
              <TableCell align="right">
                {'-'} {/* Interest not available */}
              </TableCell>
              <TableCell>{payment.notes || '-'}</TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
            <TableCell>
              <strong>סה"כ</strong>
            </TableCell>
            <TableCell align="right">
              <strong>₪{totalAmount.toLocaleString()}</strong>
            </TableCell>
            <TableCell align="right">
              <strong>{totalPrincipal > 0 ? `₪${totalPrincipal.toLocaleString()}` : '-'}</strong>
            </TableCell>
            <TableCell align="right">
              <strong>{totalInterest > 0 ? `₪${totalInterest.toLocaleString()}` : '-'}</strong>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
