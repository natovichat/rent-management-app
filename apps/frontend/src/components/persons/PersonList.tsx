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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  IconButton,
  Fab,
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

const TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'יחיד',
  COMPANY: 'חברה',
  PARTNERSHIP: 'שותפות',
};

interface MobilePersonCardProps {
  item: Person;
  onEdit: () => void;
  onDelete: () => void;
}

function MobilePersonCard({ item, onEdit, onDelete }: MobilePersonCardProps) {
  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }} variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {item.name}
          </Typography>
          <Chip
            label={TYPE_LABELS[item.type] || item.type || '-'}
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
          {item.email && (
            <Typography variant="body2" color="text.secondary">
              {item.email}
            </Typography>
          )}
          {item.phone && (
            <Typography variant="body2" color="text.secondary">
              {item.phone}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={onEdit} aria-label="עריכה">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={onDelete} aria-label="מחיקה" color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default function PersonList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      field: 'type',
      headerName: 'סוג',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => TYPE_LABELS[params.value] || params.value || '-',
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

      <Box sx={{ height: isMobile ? 'auto' : 600, width: '100%' }}>
        {isMobile ? (
          <Box>
            {isLoading ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                טוען...
              </Typography>
            ) : (
              <>
                {(data?.data || []).map((item) => (
                  <MobilePersonCard
                    key={item.id}
                    item={item}
                    onEdit={() => {
                      setSelectedPerson(item);
                      setOpenForm(true);
                    }}
                    onDelete={() => {
                      setPersonToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    אין נתונים להצגה
                  </Typography>
                )}
              </>
            )}
          </Box>
        ) : (
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
        )}
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

      {isMobile && (
        <Fab
          color="primary"
          aria-label="הוסף אדם"
          sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1200 }}
          onClick={() => {
            setSelectedPerson(null);
            setOpenForm(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
