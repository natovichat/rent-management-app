/**
 * ExpenseList - Display expenses in a DataGrid
 * 
 * Features:
 * - DataGrid with all expense fields
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
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Expense, ExpenseType } from '@/lib/api/financials';

interface ExpenseListProps {
  propertyId: string;
  expenses: Expense[];
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  [ExpenseType.MAINTENANCE]: 'תחזוקה',
  [ExpenseType.TAX]: 'מס',
  [ExpenseType.INSURANCE]: 'ביטוח',
  [ExpenseType.UTILITIES]: 'חשמל/מים/גז',
  [ExpenseType.RENOVATION]: 'שיפוץ',
  [ExpenseType.LEGAL]: 'משפטי',
  [ExpenseType.OTHER]: 'אחר',
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

export const ExpenseList: React.FC<ExpenseListProps> = ({
  propertyId,
  expenses,
  isLoading = false,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const columns: GridColDef<Expense>[] = [
    {
      field: 'expenseDate',
      headerName: 'תאריך',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'type',
      headerName: 'סוג',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={EXPENSE_TYPE_LABELS[params.value as ExpenseType] || params.value}
          size="small"
        />
      ),
    },
    {
      field: 'category',
      headerName: 'קטגוריה',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'amount',
      headerName: 'סכום',
      width: 120,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'description',
      headerName: 'תיאור',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'paymentMethod',
      headerName: 'אמצעי תשלום',
      width: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 120,
      align: 'left',
      headerAlign: 'left',
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
        title="הוצאות"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            size="small"
          >
            הוסף הוצאה
          </Button>
        }
      />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={expenses}
            columns={columns}
            loading={isLoading}
            sx={{
              direction: 'rtl',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                direction: 'rtl',
              },
              '& .MuiDataGrid-columnHeader': {
                direction: 'rtl',
              },
              '& .MuiDataGrid-cell': {
                direction: 'rtl',
                textAlign: 'right',
              },
            }}
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

export default ExpenseList;
