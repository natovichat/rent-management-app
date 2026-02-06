'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Lease } from '@/lib/api/leases';
import { useRouter } from 'next/navigation';

interface LeasesPanelProps {
  leases: Lease[];
  isLoading?: boolean;
}

export default function LeasesPanel({ leases, isLoading }: LeasesPanelProps) {
  const router = useRouter();

  if (!leases || leases.length === 0) {
    return (
      <Alert severity="info">
        לא נמצאו חוזי שכירות לנכס זה
      </Alert>
    );
  }

  // Calculate summary statistics
  const totalMonthlyIncome = leases
    .filter(lease => lease.status === 'ACTIVE')
    .reduce((sum, lease) => {
      const rent = typeof lease.monthlyRent === 'string' 
        ? parseFloat(lease.monthlyRent) 
        : lease.monthlyRent;
      return sum + (isNaN(rent) ? 0 : rent);
    }, 0);

  const activeCount = leases.filter(lease => lease.status === 'ACTIVE').length;

  // Define columns in requested order: פעולות, נכס, דייר, תאריך סיום, שכירות חודשית
  const columns: GridColDef[] = [
    // 1. פעולות (עמודה ראשונה - ימינה ביותר)
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 120,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="צפייה"
          onClick={() => router.push(`/leases/${params.row.id}`)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => router.push(`/leases/${params.row.id}`)}
        />,
      ],
    },
    // 2. נכס
    {
      field: 'unit',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => {
        const unit = params?.value;
        if (!unit) return '';
        const property = unit.property;
        if (!property) return `דירה ${unit.apartmentNumber}`;
        return `${property.address} - דירה ${unit.apartmentNumber}`;
      },
    },
    // 3. דייר
    {
      field: 'tenant',
      headerName: 'דייר',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params?.value?.name || '',
    },
    // 4. תאריך סיום
    {
      field: 'endDate',
      headerName: 'תאריך סיום',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('he-IL');
      },
    },
    // 5. שכירות חודשית
    {
      field: 'monthlyRent',
      headerName: 'שכירות חודשית',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        const rent = typeof params.value === 'string' 
          ? parseFloat(params.value) 
          : params.value;
        return `₪${Number(rent).toLocaleString('he-IL')}`;
      },
    },
  ];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              סה"כ חוזים
            </Typography>
            <Typography variant="h4" color="primary">
              {leases.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              חוזים פעילים
            </Typography>
            <Typography variant="h4" color="success.main">
              {activeCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              הכנסה חודשית
            </Typography>
            <Typography variant="h4" color="success.main">
              ₪{totalMonthlyIncome.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* DataGrid Table */}
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={leases}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          sx={{
            direction: 'rtl',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              direction: 'rtl',
            },
            '& .MuiDataGrid-columnHeader': {
              direction: 'rtl',
              '& .MuiDataGrid-columnHeaderTitle': {
                textAlign: 'right',
                width: '100%',
                paddingRight: '8px',
              },
            },
            '& .MuiDataGrid-cell': {
              direction: 'rtl',
              textAlign: 'right',
              paddingRight: '16px',
            },
            // Highlight active leases
            '& .MuiDataGrid-row': {
              '&.lease-active': {
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.12)',
                },
              },
            },
          }}
          getRowId={(row) => row.id}
          getRowClassName={(params) => 
            params.row.status === 'ACTIVE' ? 'lease-active' : ''
          }
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Box>
    </Box>
  );
}
