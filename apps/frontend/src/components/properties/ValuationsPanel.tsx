/**
 * ValuationsPanel - Display property valuations in a table
 * 
 * Features:
 * - Table view of all valuations
 * - Ordered by date (newest first)
 * - Shows valuation type, date, value, valuated by, notes
 * - Empty state when no valuations
 * - RTL layout support
 * - Hebrew labels
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { Valuation } from '@/lib/api/valuations';

interface ValuationsPanelProps {
  propertyId: string;
  valuations: Valuation[];
  isLoading?: boolean;
}

// Helper functions
const getValuationTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    MARKET: 'שווי שוק',
    PURCHASE: 'מחיר רכישה',
    TAX: 'שווי מס',
    APPRAISAL: 'שמאות',
  };
  return labels[type] || type;
};

const getValuationTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
  const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
    MARKET: 'primary',
    PURCHASE: 'success',
    TAX: 'warning',
    APPRAISAL: 'secondary',
  };
  return colors[type] || 'default';
};

const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(numValue);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

export const ValuationsPanel: React.FC<ValuationsPanelProps> = ({
  propertyId,
  valuations,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader
          avatar={<AssessmentIcon />}
          title="הערכות שווי"
        />
        <CardContent>
          <Typography>טוען...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (valuations.length === 0) {
    return (
      <Card>
        <CardHeader
          avatar={<AssessmentIcon />}
          title="הערכות שווי"
        />
        <CardContent>
          <Alert severity="info">לא נמצאו הערכות שווי לנכס זה</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        avatar={<AssessmentIcon />}
        title="הערכות שווי"
        subheader={`סה"כ ${valuations.length} הערכות`}
      />
      <CardContent>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ direction: 'rtl' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>תאריך הערכה</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>סוג הערכה</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="left">שווי משוער</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>מעריך</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>הערות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {valuations.map((valuation) => (
                <TableRow key={valuation.id} hover>
                  <TableCell>{formatDate(valuation.valuationDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getValuationTypeLabel(valuation.valuationType)}
                      color={getValuationTypeColor(valuation.valuationType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: 600 }}>
                    {formatCurrency(valuation.estimatedValue)}
                  </TableCell>
                  <TableCell>{valuation.valuatedBy || '-'}</TableCell>
                  <TableCell>
                    {valuation.notes ? (
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {valuation.notes}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ValuationsPanel;
