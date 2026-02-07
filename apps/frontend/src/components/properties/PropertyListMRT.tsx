'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
  Link,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { propertiesApi, Property, PropertyFilters } from '@/services/properties';
import { useAccount } from '@/contexts/AccountContext';
import PropertyForm from './PropertyForm';
import PropertyCsvActions from './PropertyCsvActions';
import PropertyFilterPanel from './PropertyFilterPanel';
import ActiveFiltersChips from './ActiveFiltersChips';

export default function PropertyListMRT() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [openForm, setOpenForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deletedPropertyIds, setDeletedPropertyIds] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const isInitializingFromUrl = useRef(true);

  useEffect(() => {
    if (!isInitializingFromUrl.current) return;
    
    const urlFilters: PropertyFilters = {};
    const types = searchParams.getAll('type[]');
    if (types.length > 0) {
      urlFilters.type = types.length === 1 ? types[0] as any : types as any[];
    }
    const statuses = searchParams.getAll('status[]');
    if (statuses.length > 0) {
      urlFilters.status = statuses.length === 1 ? statuses[0] as any : statuses as any[];
    }
    const city = searchParams.get('city');
    if (city) urlFilters.city = city;
    const country = searchParams.get('country');
    if (country) urlFilters.country = country;
    const isMortgaged = searchParams.get('isMortgaged');
    if (isMortgaged === 'true') urlFilters.isMortgaged = true;
    const searchParam = searchParams.get('search');
    if (searchParam) setSearch(searchParam);

    setFilters(urlFilters);
    isInitializingFromUrl.current = false;
  }, [searchParams]);

  useEffect(() => {
    if (isInitializingFromUrl.current) return;
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      types.forEach((type) => params.append('type[]', type));
    }
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach((status) => params.append('status[]', status));
    }
    if (filters.city) params.append('city', filters.city);
    if (filters.country) params.append('country', filters.country);
    if (filters.isMortgaged) params.append('isMortgaged', 'true');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [debouncedSearch, filters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['properties', selectedAccountId, pagination.pageIndex + 1, pagination.pageSize, debouncedSearch, filters],
    queryFn: () =>
      propertiesApi.getProperties(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearch,
        filters,
      ),
    enabled: !!selectedAccountId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.deleteProperty(id),
    onSuccess: (_, deletedId) => {
      setDeletedPropertyIds(prev => new Set(prev).add(deletedId));
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setSnackbar({ open: true, message: 'הנכס נמחק בהצלחה', severity: 'success' });
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה במחיקת הנכס', severity: 'error' });
    },
  });

  const columns = useMemo<MRT_ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: 'fileNumber',
        header: 'מספר תיק',
        size: 150,
        Cell: ({ cell }) => cell.getValue() || '-',
      },
      {
        accessorKey: 'address',
        header: 'כתובת',
        size: 300,
        Cell: ({ row }) => (
          <Link
            component="button"
            variant="body2"
            onClick={() => router.push(`/properties/${row.original.id}`)}
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' },
              cursor: 'pointer',
            }}
          >
            {row.original.address}
          </Link>
        ),
      },
      {
        accessorKey: 'unitCount',
        header: 'מספר יחידות',
        size: 120,
      },
      {
        accessorKey: 'isMortgaged',
        header: 'סטטוס משכון',
        size: 120,
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <Chip
              label="משועבד"
              size="small"
              color="warning"
              icon={<AccountBalanceIcon />}
            />
          ) : null,
      },
      {
        accessorKey: 'createdAt',
        header: 'תאריך יצירה',
        size: 150,
        Cell: ({ cell }) => {
          const value = cell.getValue() as string;
          return new Date(value).toLocaleDateString('he-IL');
        },
      },
    ],
    [router],
  );

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setOpenForm(true);
  };

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(propertyToDelete.id);
    }
  };

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleRemoveFilter = (filterKey: keyof PropertyFilters, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value && Array.isArray(newFilters[filterKey])) {
        newFilters[filterKey] = (newFilters[filterKey] as string[]).filter((v) => v !== value);
        if ((newFilters[filterKey] as string[]).length === 0) {
          delete newFilters[filterKey];
        }
      } else {
        delete newFilters[filterKey];
      }
      return newFilters;
    });
  };

  const displayData = useMemo(() => {
    const allRows = data?.data || [];
    return allRows.filter(p => !deletedPropertyIds.has(p.id));
  }, [data?.data, deletedPropertyIds]);

  const totalCount = Math.max(0, (data?.meta.total || 0) - deletedPropertyIds.size);

  return (
    <Box sx={{ direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <PropertyCsvActions />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedProperty(null);
              setOpenForm(true);
            }}
          >
            נכס חדש
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <PropertyFilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />
      </Box>

      <ActiveFiltersChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearFilters}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת הנכסים. אנא נסה שוב.
        </Alert>
      )}

      <MaterialReactTable
        columns={columns}
        data={displayData}
        enableColumnOrdering
        enableColumnResizing
        enableStickyHeader
        enableRowActions
        positionActionsColumn="first"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="צפייה">
              <IconButton
                size="small"
                onClick={() => router.push(`/properties/${row.original.id}`)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="עריכה">
              <IconButton size="small" onClick={() => handleEdit(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="מחיקה">
              <IconButton size="small" onClick={() => handleDelete(row.original)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        manualPagination
        rowCount={totalCount}
        state={{ isLoading, pagination }}
        onPaginationChange={setPagination}
        muiTableProps={{ sx: { direction: 'rtl' } }}
        muiTableHeadCellProps={{
          sx: {
            textAlign: 'right',
            '& .Mui-TableHeadCell-Content': {
              justifyContent: 'flex-end',
            },
          },
        }}
        muiTableBodyCellProps={{ sx: { textAlign: 'right' } }}
      />

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProperty ? 'עריכת נכס' : 'נכס חדש'}</DialogTitle>
        <DialogContent>
          <PropertyForm
            property={selectedProperty}
            onSuccess={() => {
              setOpenForm(false);
              setSelectedProperty(null);
              refetch();
            }}
            onCancel={() => {
              setOpenForm(false);
              setSelectedProperty(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הנכס "{propertyToDelete?.address}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleConfirmDelete}
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
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
