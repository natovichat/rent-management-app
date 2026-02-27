'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  personsApi,
  Person,
} from '@/lib/api/persons';
import PersonForm from './PersonForm';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

export default function PersonList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [openForm, setOpenForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['persons', page, pageSize, debouncedSearch],
    queryFn: () => personsApi.getPersons(page, pageSize, debouncedSearch || undefined),
  });

  const persons = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => personsApi.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      setDeleteDialogOpen(false);
      setPersonToDelete(null);
      setSnackbar({
        open: true,
        message: 'אדם נמחק בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה במחיקת אדם',
        severity: 'error',
      });
    },
  });

  const columns: GridColDef<Person>[] = [
    {
      field: 'name',
      headerName: 'שם',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'idNumber',
      headerName: 'תעודת זהות',
      width: 140,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'email',
      headerName: 'אימייל',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'phone',
      headerName: 'טלפון',
      width: 140,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => {
            setSelectedPerson(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setPersonToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const handleFormSuccess = () => {
    setOpenForm(false);
    setSelectedPerson(null);
    setSnackbar({
      open: true,
      message: selectedPerson ? 'אדם עודכן בהצלחה' : 'אדם נוסף בהצלחה',
      severity: 'success',
    });
  };

  const handleDelete = () => {
    if (personToDelete) {
      deleteMutation.mutate(personToDelete.id);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="חפש לפי שם, תעודת זהות, אימייל או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedPerson(null);
            setOpenForm(true);
          }}
          sx={{ ml: 2 }}
        >
          הוסף אדם
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={persons}
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
          }}
          paginationMode="server"
          rowCount={data?.meta?.total || 0}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowId={(row) => row.id}
        />
      </Box>

      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedPerson(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPerson ? 'עריכת אדם' : 'אדם חדש'}
        </DialogTitle>
        <DialogContent>
          <PersonForm
            person={selectedPerson}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpenForm(false);
              setSelectedPerson(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת אדם</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את האדם &quot;{personToDelete?.name}&quot;?
            פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
