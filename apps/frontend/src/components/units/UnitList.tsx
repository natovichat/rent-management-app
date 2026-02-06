'use client';

import { useState, useMemo, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  Snackbar,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { unitsApi, Unit, UnitFilters, UnitType, OccupancyStatus } from '@/services/units';
import { propertiesApi } from '@/services/properties';
import { useAccount } from '@/contexts/AccountContext';
import UnitForm from './UnitForm';
import UnitDetails from './UnitDetails';

export default function UnitList() {
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300); // Debounce search input by 300ms
  const [filters, setFilters] = useState<UnitFilters>({
    propertyId: '',
    unitType: undefined,
    floor: undefined,
    roomCount: undefined,
    occupancyStatus: undefined,
  });
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch properties for filter dropdown (filtered by account automatically)
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', selectedAccountId, 'all'],
    queryFn: () => propertiesApi.getAll(1, 100, undefined), // accountId automatic via interceptor
    enabled: !!selectedAccountId,
  });

  // Reset to page 1 when filters or debounced search change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);

  // Build filters object for API call (use debounced search value)
  const apiFilters: UnitFilters = useMemo(() => ({
    ...filters,
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [filters, debouncedSearch]);

  // Fetch units (filtered by account via backend)
  const { data, isLoading } = useQuery({
    queryKey: ['units', selectedAccountId, page, apiFilters],
    queryFn: () =>
      unitsApi.getAll(apiFilters, page, 10),
    enabled: !!selectedAccountId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: unitsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setError(null);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
      setSnackbar({
        open: true,
        message: 'הדירה נמחקה בהצלחה',
        severity: 'success',
      });
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        'שגיאה במחיקת הדירה';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  const handleFilterChange = (key: keyof UnitFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' || value === 'ALL' ? undefined : value,
    }));
    setPage(1); // Reset to first page when filter changes
  };

  const handlePropertyFilterChange = (event: SelectChangeEvent<string>) => {
    handleFilterChange('propertyId', event.target.value);
  };

  const handleUnitTypeFilterChange = (event: SelectChangeEvent<string>) => {
    handleFilterChange('unitType', event.target.value as UnitType | undefined);
  };

  const handleFloorFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    handleFilterChange('floor', value === '' ? undefined : parseInt(value, 10));
  };

  const handleRoomCountFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    handleFilterChange('roomCount', value === '' ? undefined : parseInt(value, 10));
  };

  const handleOccupancyStatusFilterChange = (event: SelectChangeEvent<string>) => {
    handleFilterChange('occupancyStatus', event.target.value as OccupancyStatus | undefined);
  };

  const handleClearFilters = () => {
    setFilters({
      propertyId: '',
      unitType: undefined,
      floor: undefined,
      roomCount: undefined,
      occupancyStatus: undefined,
    });
    setPage(1);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.propertyId ||
      filters.unitType ||
      filters.floor !== undefined ||
      filters.roomCount !== undefined ||
      filters.occupancyStatus
    );
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setOpenForm(true);
  };

  const handleView = (unit: Unit) => {
    setSelectedUnit(unit);
    setOpenDetails(true);
  };

  const handleDelete = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (unitToDelete) {
      deleteMutation.mutate(unitToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUnitToDelete(null);
    setError(null);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedUnit(null);
  };

  const handleDetailsClose = () => {
    setOpenDetails(false);
    setSelectedUnit(null);
  };

  const columns: GridColDef<Unit>[] = [
    {
      field: 'apartmentNumber',
      headerName: 'דירה',
      flex: 1,
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'property',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.property?.address || '',
      renderCell: (params) => params.row.property?.address || '-',
    },
    {
      field: 'floor',
      headerName: 'קומה',
      width: 100,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.value ?? '-',
    },
    {
      field: 'roomCount',
      headerName: 'חדרים',
      width: 100,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.value ?? '-',
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 150,
      type: 'dateTime',
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => new Date(params.value),
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
          key="view"
          icon={<VisibilityIcon />}
          label="צפייה"
          onClick={() => handleView(params.row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header with Filters and Add Button */}
      <Box sx={{ mb: 3 }}>
        {/* Search Input */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="חיפוש לפי מספר דירה או כתובת נכס..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputProps={{ 'data-testid': 'unit-search-input' }}
            sx={{
              '& .MuiInputBase-root': {
                direction: 'rtl',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            {/* Property Filter */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="property-filter-label">סינון לפי נכס</InputLabel>
              <Select
                labelId="property-filter-label"
                id="property-filter"
                value={filters.propertyId || ''}
                label="סינון לפי נכס"
                onChange={handlePropertyFilterChange}
                inputProps={{ 'data-testid': 'property-filter-select' }}
              >
                <MenuItem value="">כל הנכסים</MenuItem>
                {propertiesData?.data.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Clear Filters Button */}
            {(hasActiveFilters() || search) && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => {
                  handleClearFilters();
                  setSearch('');
                }}
                size="small"
              >
                נקה סינון
              </Button>
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUnit(null);
              setOpenForm(true);
            }}
          >
            דירה חדשה
          </Button>
        </Box>

        {/* Advanced Filters Accordion */}
        <Accordion defaultExpanded={false}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ direction: 'rtl' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              <Typography>סינון מתקדם</Typography>
              {hasActiveFilters() && (
                <Chip
                  label={Object.values(filters).filter((v) => v !== undefined && v !== '').length}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ direction: 'rtl' }}>
              {/* Unit Type Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="unit-type-filter-label">סוג יחידה</InputLabel>
                  <Select
                    labelId="unit-type-filter-label"
                    id="unit-type-filter"
                    value={filters.unitType || 'ALL'}
                    label="סוג יחידה"
                    onChange={handleUnitTypeFilterChange}
                    data-testid="unit-type-filter"
                  >
                    <MenuItem value="ALL">כל הסוגים</MenuItem>
                    <MenuItem value={UnitType.APARTMENT}>דירה</MenuItem>
                    <MenuItem value={UnitType.STUDIO}>סטודיו</MenuItem>
                    <MenuItem value={UnitType.PENTHOUSE}>פנטהאוז</MenuItem>
                    <MenuItem value={UnitType.COMMERCIAL}>מסחרי</MenuItem>
                    <MenuItem value={UnitType.STORAGE}>מחסן</MenuItem>
                    <MenuItem value={UnitType.PARKING}>חניה</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Floor Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="קומה"
                  type="number"
                  value={filters.floor ?? ''}
                  onChange={handleFloorFilterChange}
                  inputProps={{ 'data-testid': 'floor-filter' }}
                  placeholder="כל הקומות"
                />
              </Grid>

              {/* Room Count Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="מספר חדרים"
                  type="number"
                  value={filters.roomCount ?? ''}
                  onChange={handleRoomCountFilterChange}
                  inputProps={{ 'data-testid': 'room-count-filter' }}
                  placeholder="כל החדרים"
                />
              </Grid>

              {/* Occupancy Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="occupancy-status-filter-label">סטטוס תפוסה</InputLabel>
                  <Select
                    labelId="occupancy-status-filter-label"
                    id="occupancy-status-filter"
                    value={filters.occupancyStatus || 'ALL'}
                    label="סטטוס תפוסה"
                    onChange={handleOccupancyStatusFilterChange}
                    data-testid="occupancy-status-filter"
                  >
                    <MenuItem value="ALL">כל הסטטוסים</MenuItem>
                    <MenuItem value={OccupancyStatus.VACANT}>פנוי</MenuItem>
                    <MenuItem value={OccupancyStatus.OCCUPIED}>תפוס</MenuItem>
                    <MenuItem value={OccupancyStatus.UNDER_RENOVATION}>בשיפוץ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={data?.data || []}
        columns={columns}
        loading={isLoading}
        paginationMode="server"
        rowCount={data?.meta.total || 0}
        paginationModel={{ page: page - 1, pageSize: 10 }}
        onPaginationModelChange={(model) => setPage(model.page + 1)}
        autoHeight
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
        }}
      />

      {/* Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <UnitForm
          unit={selectedUnit}
          onClose={handleFormClose}
        />
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        {selectedUnit && (
          <UnitDetails
            unitId={selectedUnit.id}
            onClose={handleDetailsClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>מחיקת דירה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הדירה "{unitToDelete?.apartmentNumber}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            פעולה זו לא ניתנת לביטול. הדירה יימחק לצמיתות.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>ביטול</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
