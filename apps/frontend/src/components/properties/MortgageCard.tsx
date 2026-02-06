/**
 * MortgageCard - Mortgage/loan display with payment tracking
 * 
 * Features:
 * - Mortgage details (bank, amount, rate, monthly payment)
 * - Payment progress bar
 * - Collateral properties alert
 * - Expandable payment history
 * - Status indicator
 * - Remaining balance calculation
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Collapse,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  AccountBalance as BankIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Types
interface MortgagePayment {
  id: string;
  paymentDate: string;
  amount: number;
  principal?: number;
  interest?: number;
  notes?: string;
}

interface Mortgage {
  id: string;
  bank: string;
  loanAmount: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
  linkedProperties: string[];
  bankAccountId?: string;
  notes?: string;
  payments?: MortgagePayment[];
  bankAccount?: {
    id: string;
    bankName: string;
    branchNumber?: string;
    accountNumber: string;
    accountType: string;
  };
}

interface MortgageCardProps {
  mortgage: Mortgage;
  propertyAddress?: string;
  onEdit?: (mortgage: Mortgage) => void;
}

// Helper functions
const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAID_OFF':
      return 'default';
    case 'REFINANCED':
      return 'warning';
    case 'DEFAULTED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string): string => {
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

const calculateRemainingBalance = (
  loanAmount: number,
  payments?: MortgagePayment[]
): number => {
  if (!payments || payments.length === 0) return loanAmount;
  
  const totalPaid = payments.reduce((sum, payment) => {
    return sum + (payment.principal || payment.amount);
  }, 0);
  
  return Math.max(0, loanAmount - totalPaid);
};

const calculatePaidPercentage = (
  loanAmount: number,
  payments?: MortgagePayment[]
): number => {
  const remaining = calculateRemainingBalance(loanAmount, payments);
  const paid = loanAmount - remaining;
  return (paid / loanAmount) * 100;
};

// Metric Card Component
const MetricCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      textAlign: 'center',
      bgcolor: 'action.hover',
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
      {icon}
    </Box>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="h6" fontWeight="600">
      {value}
    </Typography>
  </Paper>
);

export const MortgageCard: React.FC<MortgageCardProps> = ({
  mortgage,
  propertyAddress,
  onEdit,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const remainingBalance = calculateRemainingBalance(
    mortgage.loanAmount,
    mortgage.payments
  );
  const paidPercentage = calculatePaidPercentage(
    mortgage.loanAmount,
    mortgage.payments
  );

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on edit button or expand button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/mortgages/${mortgage.id}`);
  };

  return (
    <Card sx={{ cursor: 'pointer' }} onClick={handleCardClick}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BankIcon color="primary" />
            <Typography variant="h6">{mortgage.bank}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={getStatusLabel(mortgage.status)}
              color={getStatusColor(mortgage.status)}
              size="small"
            />
            {onEdit && (
              <IconButton size="small" color="primary" onClick={() => onEdit(mortgage)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Property Address (if provided) */}
        {propertyAddress && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            📍 {propertyAddress}
          </Typography>
        )}

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <MetricCard
              label="סכום הלוואה"
              value={formatCurrency(mortgage.loanAmount)}
              icon={<MoneyIcon color="action" fontSize="small" />}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              label="תשלום חודשי"
              value={mortgage.monthlyPayment ? formatCurrency(mortgage.monthlyPayment) : '-'}
              icon={<EventIcon color="action" fontSize="small" />}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              label="ריבית"
              value={mortgage.interestRate ? `${mortgage.interestRate}%` : '-'}
              icon={<TrendingUpIcon color="action" fontSize="small" />}
            />
          </Grid>
        </Grid>

        {/* Progress Bar */}
        {mortgage.status === 'ACTIVE' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                יתרה
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {formatCurrency(remainingBalance)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={paidPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                שולם: {paidPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                נותרו: {(100 - paidPercentage).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        )}

        {/* Dates */}
        <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              תאריך התחלה
            </Typography>
            <Typography variant="body2">{formatDate(mortgage.startDate)}</Typography>
          </Box>
          {mortgage.endDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                תאריך סיום
              </Typography>
              <Typography variant="body2">{formatDate(mortgage.endDate)}</Typography>
            </Box>
          )}
        </Box>

        {/* Bank Account for Automatic Payments */}
        {mortgage.bankAccount && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              חשבון בנק להוראת קבע
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <BankIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="500">
                {mortgage.bankAccount.branchNumber
                  ? `${mortgage.bankAccount.bankName} - ${mortgage.bankAccount.branchNumber}/${mortgage.bankAccount.accountNumber}`
                  : `${mortgage.bankAccount.bankName} - ${mortgage.bankAccount.accountNumber}`}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Collateral Properties Alert */}
        {mortgage.linkedProperties.length > 1 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            משועבד יחד עם {mortgage.linkedProperties.length - 1} נכסים נוספים
          </Alert>
        )}

        {/* Notes */}
        {mortgage.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              הערות:
            </Typography>
            <Typography variant="body2">{mortgage.notes}</Typography>
          </Box>
        )}

        {/* Payment History Toggle */}
        {mortgage.payments && mortgage.payments.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={handleToggleExpand}
            >
              <Typography variant="subtitle2" color="primary">
                היסטוריית תשלומים ({mortgage.payments.length})
              </Typography>
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Expandable Payment History */}
            <Collapse in={expanded}>
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>תאריך</TableCell>
                      <TableCell align="right">סכום</TableCell>
                      <TableCell align="right">קרן</TableCell>
                      <TableCell align="right">ריבית</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mortgage.payments
                      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                      .slice(0, 10)
                      .map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell align="right">
                            {payment.principal ? formatCurrency(payment.principal) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {payment.interest ? formatCurrency(payment.interest) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {mortgage.payments.length > 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  מוצגים 10 תשלומים אחרונים
                </Typography>
              )}
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MortgageCard;
