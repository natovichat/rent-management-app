'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Link,
  Chip,
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

/**
 * PropertyList component - Displays properties in a DataGrid with RTL support.
 * 
 * Features:
 * - Server-side pagination
 * - Search functionality
 * - Create/Edit/Delete actions
 * - Navigation to property details (clickable address + view button)
 * - Column reordering (drag and drop)
 * - Hebrew RTL layout
 * - React Query for caching
 * 
 * Column Order (RTL - right to left):
 * 1. כתובת (Address) - Clickable link
 * 2. מספר תיק (File Number)
 * 3. מספר יחידות (Unit Count)
 * 4. סטטוס משכון (Mortgage Status) - Shows "משועבד" chip for mortgaged properties
 * 5. תאריך יצירה (Created At)
 * 6. פעולות (Actions)
 */
export default function PropertyList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount(); // Get selected account from context
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300); // Debounce search input by 300ms
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [openForm, setOpenForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deletedPropertyIds, setDeletedPropertyIds] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const isInitializingFromUrl = useRef(true);

  // Initialize filters from URL params (on mount)
  useEffect(() => {
    if (!isInitializingFromUrl.current) {
      return; // Only initialize once
    }
    const urlFilters: PropertyFilters = {};
    
    // Parse type filters
    const types = searchParams.getAll('type[]');
    if (types.length > 0) {
      urlFilters.type = types.length === 1 ? types[0] as any : types as any[];
    }

    // Parse status filters
    const statuses = searchParams.getAll('status[]');
    if (statuses.length > 0) {
      urlFilters.status = statuses.length === 1 ? statuses[0] as any : statuses as any[];
    }

    // Parse city
    const city = searchParams.get('city');
    if (city) {
      urlFilters.city = city;
    }

    // Parse country
    const country = searchParams.get('country');
    if (country) {
      urlFilters.country = country;
    }

    // Parse isMortgaged
    const isMortgaged = searchParams.get('isMortgaged');
    if (isMortgaged === 'true') {
      urlFilters.isMortgaged = true;
    }

    // Parse search
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }

    setFilters(urlFilters);
    isInitializingFromUrl.current = false; // Mark initialization complete
  }, []); // Only run on mount

  // Restore search from URL when navigating back (compare URL with debouncedSearch)
  useEffect(() => {
    if (isInitializingFromUrl.current) {
      return; // Skip during initial load
    }
    
    const urlSearchParam = searchParams.get('search') || '';
    // Only restore if URL has different search than our debounced value (navigation back scenario)
    if (urlSearchParam !== debouncedSearch) {
      setSearch(urlSearchParam);
    }
  }, [searchParams]); // Run when searchParams change (navigation)

  // Sync filters to URL (skip during initialization to avoid loop)
  useEffect(() => {
    if (isInitializingFromUrl.current) {
      return;
    }

    const params = new URLSearchParams();
    
    // Add search (use debounced value for URL to avoid rapid URL changes)
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }

    // Add type filters
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      types.forEach((type) => params.append('type[]', type));
    }

    // Add status filters
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach((status) => params.append('status[]', status));
    }

    // Add city
    if (filters.city) {
      params.append('city', filters.city);
    }

    // Add country
    if (filters.country) {
      params.append('country', filters.country);
    }

    // Add isMortgaged
    if (filters.isMortgaged) {
      params.append('isMortgaged', 'true');
    }

    // Update URL without navigation
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, debouncedSearch, router]);

  // Reset to page 1 when filters or debounced search change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);

  // Build filters object for API call (use debounced search value)
  // Use useMemo to stabilize the object reference for React Query
  const apiFilters: PropertyFilters = useMemo(() => ({
    ...filters,
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [filters, debouncedSearch]);

  // Fetch properties with filters
  // Note: accountId is automatically added by API interceptor from localStorage
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', selectedAccountId, page, pageSize, apiFilters], // Include accountId in query key for cache invalidation
    queryFn: () => propertiesApi.getAll(page, pageSize, apiFilters), // No need to pass accountId - it's automatic!
    enabled: !!selectedAccountId, // Only fetch when account is selected
  });

  // Clear deleted IDs when data changes (new fetch means deletions are reflected server-side)
  useEffect(() => {
    if (data?.data) {
      setDeletedPropertyIds(prev => {
        const newSet = new Set(prev);
        // Remove IDs that are no longer in the data (server confirmed deletion)
        data.data.forEach(p => newSet.delete(p.id));
        return newSet;
      });
    }
  }, [data?.data]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: propertiesApi.delete,
    onSuccess: async (_, deletedPropertyId) => {
      const deletedProperty = propertyToDelete;
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      
      if (deletedProperty) {
        // Add to deleted set for immediate UI update
        setDeletedPropertyIds(prev => new Set(prev).add(deletedProperty.id));
      }
      
      // Remove all property queries from cache to force fresh fetch
      queryClient.removeQueries({ 
        queryKey: ['properties'],
        exact: false
      });
      
      // Small delay to ensure backend transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refetch all active property queries with fresh data
      await queryClient.refetchQueries({ 
        queryKey: ['properties'],
        exact: false,
        type: 'active'
      });
      
      setSnackbar({
        open: true,
        message: 'הנכס נמחק בהצלחה ✓',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      console.error('[PropertyList] Delete error:', error);
      console.error('[PropertyList] Error response:', error.response);
      console.error('[PropertyList] Error status:', error.response?.status);
      
      // Handle 403 (has units) vs other errors
      const status = error.response?.status || error.status;
      const errorMessage = status === 403
        ? 'לא ניתן למחוק נכס עם יחידות קיימות. יש למחוק את היחידות תחילה.'
        : error.response?.data?.message || error.message || 'שגיאה במחיקת הנכס';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      // Keep dialog open on error so user can see the error message
    },
  });

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(propertyToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const columns: GridColDef<Property>[] = [
    {
      field: 'address',
      headerName: 'כתובת',
      flex: 1,
      minWidth: 250,
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Link
          component="button"
          variant="body2"
          onClick={() => router.push(`/properties/${params.row.id}`)}
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': {
              textDecoration: 'underline',
            },
            cursor: 'pointer',
            textAlign: 'right',
            width: '100%',
            display: 'block',
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'fileNumber',
      headerName: 'מספר תיק',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'unitCount',
      headerName: 'מספר יחידות',
      width: 120,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'isMortgaged',
      headerName: 'סטטוס משכון',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Chip
            label="משועבד"
            size="small"
            color="warning"
            icon={<AccountBalanceIcon />}
            data-testid="mortgage-indicator"
          />
        ) : null
      ),
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 150,
      type: 'date',
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => new Date(params.value),
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('he-IL');
      },
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
          onClick={() => router.push(`/properties/${params.row.id}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => {
            setSelectedProperty(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedProperty(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 when filters change
  };

  const handleRemoveFilter = (filterKey: keyof PropertyFilters, value?: string) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'type' && filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      if (value) {
        // Remove specific type value
        const filtered = types.filter((t) => t !== value);
        if (filtered.length === 0) {
          delete newFilters.type;
        } else {
          newFilters.type = filtered.length === 1 ? filtered[0] : filtered;
        }
      } else {
        // Remove all types
        delete newFilters.type;
      }
    } else if (filterKey === 'status' && filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (value) {
        // Remove specific status value
        const filtered = statuses.filter((s) => s !== value);
        if (filtered.length === 0) {
          delete newFilters.status;
        } else {
          newFilters.status = filtered.length === 1 ? filtered[0] : filtered;
        }
      } else {
        // Remove all statuses
        delete newFilters.status;
      }
    } else {
      // Remove other filters
      delete newFilters[filterKey];
    }
    
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          direction: 'rtl',
        }}
      >
        <TextField
          placeholder="חיפוש נכסים..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          sx={{ width: 300 }}
          size="small"
        />
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

      {/* Filter Panel */}
      <PropertyFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Active Filters Chips */}
      <ActiveFiltersChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearFilters}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת הנכסים. אנא נסה שוב.
        </Alert>
      )}

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%', direction: 'ltr' }}>
        <DataGrid
          key={`properties-grid-${selectedAccountId}-${page}-${data?.meta.total || 0}-${data?.data?.length || 0}-${deletedPropertyIds.size}`}
          rows={useMemo(() => {
            const allRows = data?.data || [];
            // Filter out deleted properties for immediate UI update
            return allRows.filter(p => !deletedPropertyIds.has(p.id));
          }, [data?.data, deletedPropertyIds])}
          rowCount={Math.max(0, (data?.meta.total || 0) - deletedPropertyIds.size)}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
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
        />
      </Box>

      {/* Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <PropertyForm
          property={selectedProperty}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            // Show success notification in parent (so it persists after dialog closes)
            setSnackbar({
              open: true,
              message: 'הנכס נוסף בהצלחה ✓',
              severity: 'success',
            });
          }}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>מחיקת נכס</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הנכס "{propertyToDelete?.address}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            פעולה זו לא ניתנת לביטול. הנכס יימחק לצמיתות.
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
      {/* Success/Error Notifications - Per GENERAL_REQUIREMENTS.md Section 12.5 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          zIndex: 9999,
          '& .MuiAlert-root': {
            fontSize: '1.1rem',
            fontWeight: 600,
            minWidth: '400px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
