/**
 * IncomeList - Display income records in a DataGrid
 * 
 * Features:
 * - DataGrid with all income fields
 * - Edit/Delete actions
 * - Filtering by date range
 * - RTL layout
 * - Column reordering enabled
 */

'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Income, IncomeType } from '@/lib/api/financials';

interface IncomeListProps {
  propertyId: string;
  income: Income[];
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  [IncomeType.RENT]: 'דמי שכירות',
  [IncomeType.SALE]: 'מכירה',
  [IncomeType.CAPITAL_GAIN]: 'רווח הון',
  [IncomeType.OTHER]: 'אחר',
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

export const IncomeList: React.FC<IncomeListProps> = ({
  propertyId,
  income,
  isLoading = false,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const columns: GridColDef<Income>[] = [
    {
      field: 'incomeDate',
      headerName: 'תאריך',
      width: 120,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'type',
      headerName: 'סוג',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={INCOME_TYPE_LABELS[params.value as IncomeType] || params.value}
          size="small"
          color="success"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'סכום',
      width: 120,
      type: 'number',
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'source',
      headerName: 'מקור',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'description',
      headerName: 'תיאור',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => onDelete(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <Card>
      <CardHeader
        title="הכנסות"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            size="small"
          >
            הוסף הכנסה
          </Button>
        }
      />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={income}
            columns={columns}
            loading={isLoading}
            sx={{ direction: 'rtl' }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default IncomeList;
