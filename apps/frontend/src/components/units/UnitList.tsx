'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { unitsApi, Unit } from '@/lib/api/units';
import { propertiesApi } from '@/lib/api/properties';
import UnitForm from './UnitForm';

export default function UnitList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [propertyFilter, setPropertyFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertiesApi.getProperties(1, 100),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['units', page, propertyFilter],
    queryFn: () => unitsApi.getAll(page, 20, propertyFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: unitsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
      setSnackbar({ open: true, message: 'יחידה נמחקה בהצלחה', severity: 'success' });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err.response?.data?.message || 'שגיאה במחיקת יחידה', severity: 'error' });
    },
  });

  const columns: GridColDef<Unit>[] = [
    {
      field: 'apartmentNumber',
      headerName: 'מספר דירה',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'property',
      headerName: 'נכס',
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => params.row.property?.address || '',
    },
    {
      field: 'floor',
      headerName: 'קומה',
      width: 90,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.value ?? '-',
    },
    {
      field: 'roomCount',
      headerName: 'חדרים',
      width: 90,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.value ?? '-',
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 130,
      valueGetter: (params) => new Date(params.value).toLocaleDateString('he-IL'),
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
          onClick={() => { setSelectedUnit(params.row); setOpenForm(true); }}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => { setUnitToDelete(params.row); setDeleteDialogOpen(true); }}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>סנן לפי נכס</InputLabel>
          <Select
            value={propertyFilter}
            onChange={(e) => { setPropertyFilter(e.target.value); setPage(1); }}
            label="סנן לפי נכס"
          >
            <MenuItem value="">כל הנכסים</MenuItem>
            {propertiesData?.data?.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.address}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setSelectedUnit(null); setOpenForm(true); }}
        >
          הוסף יחידה
        </Button>
      </Box>

      <DataGrid
        rows={data?.data || []}
        columns={columns}
        loading={isLoading}
        paginationMode="server"
        rowCount={data?.meta.total || 0}
        paginationModel={{ page: page - 1, pageSize: 20 }}
        onPaginationModelChange={(model) => setPage(model.page + 1)}
        autoHeight
        disableRowSelectionOnClick
        sx={{
          direction: 'rtl',
          '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.05)' },
        }}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => { setOpenForm(false); setSelectedUnit(null); }} maxWidth="sm" fullWidth>
        <UnitForm unit={selectedUnit} onClose={() => { setOpenForm(false); setSelectedUnit(null); }} />
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>מחיקת יחידה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את היחידה &ldquo;{unitToDelete?.apartmentNumber}&rdquo;?
          </Typography>
          <Alert severity="warning" sx={{ mt: 1 }}>פעולה זו לא ניתנת לביטול.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={() => unitToDelete && deleteMutation.mutate(unitToDelete.id)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
