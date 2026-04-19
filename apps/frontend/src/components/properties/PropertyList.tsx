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
  Card,
  CardContent,
  CardActions,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountBalanceIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import { propertiesApi, Property, PropertyFilters } from '@/services/properties';
import { useConfiguredColumns } from '@/lib/hooks/useConfiguredColumns';
import { useTableConfiguration } from '@/lib/hooks/useTableConfigurations';
import { generatePropertyColumns } from '@/lib/utils/generateColumns';
import { useShowDeleted } from '@/lib/hooks/useShowDeleted';
import { getUserProfile } from '@/lib/auth';
import PropertyForm from './PropertyForm';
import PropertyCsvActions from './PropertyCsvActions';
import PropertyFilterPanel from './PropertyFilterPanel';
import ActiveFiltersChips from './ActiveFiltersChips';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'מגורים',
  COMMERCIAL: 'מסחרי',
  LAND: 'קרקע',
  MIXED_USE: 'מעורב',
};

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  OWNED: 'בבעלות',
  IN_CONSTRUCTION: 'בבנייה',
  IN_PURCHASE: 'ברכישה',
  SOLD: 'נמכר',
  INVESTMENT: 'השקעה',
};

interface MobilePropertyCardProps {
  property: Property;
  onView: (id: string) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

function MobilePropertyCard({ property, onView, onEdit, onDelete }: MobilePropertyCardProps) {
  const typeLabel = property.type ? PROPERTY_TYPE_LABELS[property.type] || property.type : null;
  const statusLabel = property.status ? PROPERTY_STATUS_LABELS[property.status] || property.status : null;

  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }}>
      <CardContent sx={{ '&:last-child': { pb: 1 } }}>
        <Typography
          component={Link}
          variant="h6"
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' },
            display: 'block',
            mb: 1,
          }}
          onClick={() => onView(property.id)}
        >
          {property.address || 'ללא כתובת'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
          {typeLabel && <Chip label={typeLabel} size="small" />}
          {statusLabel && <Chip label={statusLabel} size="small" color="default" variant="outlined" />}
        </Stack>
        {property.fileNumber && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            מספר תיק: {property.fileNumber}
          </Typography>
        )}
        {property.isMortgaged && (
          <Box sx={{ mb: 0.5 }}>
            <Chip label="משועבד" size="small" color="warning" variant="outlined" />
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          תאריך יצירה: {property.createdAt ? new Date(property.createdAt).toLocaleDateString('he-IL') : '-'}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pt: 0 }}>
        <IconButton size="small" onClick={() => onView(property.id)} aria-label="צפייה">
          <VisibilityIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(property)} aria-label="עריכה">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(property)} color="error" aria-label="מחיקה">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

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
 * Column Order (left to right in array = right to left on screen):
 * 1. מספר תיק (File Number)
 * 2. גוש/חלקה (Gush/Helka) - Land registry parcel numbers
 * 3. סטטוס משכון (Mortgage Status) - Shows "משועבד" chip for mortgaged properties
 * 4. תאריך יצירה (Created At)
 * 5. כתובת (Address) - Clickable link, PRIMARY column (LAST in array = RIGHT-MOST on screen)
 * 6. פעולות (Actions) - ALWAYS last
 */
export default function PropertyList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showDeleted } = useShowDeleted();
  const [isAdmin, setIsAdmin] = useState(false);
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

  useEffect(() => {
    const profile = getUserProfile();
    setIsAdmin(profile?.role === 'ADMIN');
  }, []);

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
    ...(isAdmin && showDeleted && { includeDeleted: true }),
  }), [filters, debouncedSearch, isAdmin, showDeleted]);

  // Fetch properties with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', page, pageSize, apiFilters],
    queryFn: () => propertiesApi.getAll(page, pageSize, apiFilters),
  });

  // Restore mutation (admin only)
  const restoreMutation = useMutation({
    mutationFn: propertiesApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setSnackbar({ open: true, message: 'הנכס שוחזר בהצלחה ✓', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בשחזור הנכס', severity: 'error' });
    },
  });

  // Filtered rows for DataGrid (hoisted here to avoid conditional hook call in JSX)
  const filteredRows = useMemo(() => {
    const allRows = data?.data || [];
    return allRows.filter(p => !deletedPropertyIds.has(p.id));
  }, [data?.data, deletedPropertyIds]);

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

  // Define ALL possible columns (not filtered by configuration)
  const allColumns: GridColDef<Property>[] = useMemo(() => {
    // All possible fields
    const allPossibleFields = [
      // Basic Information
      'address', 'fileNumber', 'type', 'status', 'country', 'city',
      // Area & Dimensions
      'totalArea', 'landArea', 'floors', 'totalUnits', 'parkingSpaces', 'balconyArea',
      // Financial
      'estimatedValue', 'acquisitionPrice', 'acquisitionDate', 'acquisitionMethod', 'rentalIncome', 'projectedValue',
      // Legal & Registry (use combined gushHelka, not individual gush/helka)
      'gushHelka', 'cadastralNumber', 'taxId', 'registrationDate', 'legalStatus',
      // Property Details
      'constructionYear', 'lastRenovationYear', 'buildingPermitNumber', 'propertyCondition', 'floor', 'storage',
      // Land Information
      'landType', 'landDesignation', 'plotSize', 'buildingPotential',
      // Ownership
      'isPartialOwnership', 'sharedOwnershipPercentage', 'coOwners', 'isMortgaged',
      // Sale Information
      'isSold', 'saleDate', 'salePrice', 'isSoldPending',
      // Management
      'propertyManager', 'managementCompany', 'managementFees', 'managementFeeFrequency',
      // Financial Obligations
      'taxAmount', 'taxFrequency', 'lastTaxPayment',
      // Insurance
      'insuranceDetails', 'insuranceExpiry',
      // Utilities & Infrastructure
      'zoning', 'utilities', 'restrictions',
      // Valuation
      'lastValuationDate', 'estimationSource',
      // Investment Company
      'investmentCompanyId',
      // Development
      'developmentStatus', 'developmentCompany', 'expectedCompletionYears',
      // General
      'propertyDetails', 'notes', 'createdAt', 'updatedAt',
    ];
    
    // Generate columns for all fields (except gushHelka which is special)
    const generatedColumns = generatePropertyColumns<Property>(
      allPossibleFields.filter(f => f !== 'gushHelka'),
      (id: string) => router.push(`/properties/${id}`)
    );

    // Add special combined gushHelka column
    const gushHelkaColumn: GridColDef<Property> = {
      field: 'gushHelka',
      headerName: 'גוש/חלקה',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderHeader: () => (
        <Box sx={{ 
          width: '100% !important', 
          textAlign: 'center !important', 
          direction: 'rtl !important',
          display: 'flex !important',
          justifyContent: 'center !important',
        }}>
          גוש/חלקה
        </Box>
      ),
      valueGetter: (params) => {
        const gush = params.row.gush;
        const helka = params.row.helka;
        if (gush && helka) {
          return `${gush}/${helka}`;
        } else if (gush) {
          return gush;
        } else if (helka) {
          return helka;
        }
        return '-';
      },
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          {params.value}
        </Box>
      ),
    };
    
    // Insert gushHelka after city
    const cityIndex = generatedColumns.findIndex(col => col.field === 'city');
    if (cityIndex >= 0) {
      generatedColumns.splice(cityIndex + 1, 0, gushHelkaColumn);
    } else {
      generatedColumns.push(gushHelkaColumn);
    }
    
    // Add actions column at the beginning (first = rightmost in RTL)
    generatedColumns.unshift({
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 160,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => {
        const isDeleted = !!params.row.deletedAt;
        if (isDeleted && isAdmin) {
          return [
            <GridActionsCellItem
              key="restore"
              icon={<RestoreIcon />}
              label="שחזר"
              onClick={() => restoreMutation.mutate(params.row.id)}
              showInMenu={false}
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label="צפייה"
            onClick={() => {
              router.push(`/properties/${params.row.id}`);
            }}
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
        ];
      },
    } as GridColDef<Property>);
    
    console.log('🔍 allColumns generated count:', generatedColumns.length);
    return generatedColumns;
  }, [router, isAdmin, restoreMutation]); // End of allColumns useMemo

  // Get configured columns based on user settings (applies visibility and ordering from database)
  const columns = useConfiguredColumns('properties', allColumns);
  
  console.log('🔍 PropertyList - columns count:', columns.length);
  console.log('🔍 PropertyList - columns fields:', columns.map(c => c.field).slice(0, 10).join(', '));

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
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
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
          sx={{ width: isMobile ? '100%' : 300 }}
          size="small"
          fullWidth={isMobile}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <PropertyCsvActions />
          <Button
            variant="contained"
            startIcon={isMobile ? undefined : <AddIcon />}
            onClick={() => {
              setSelectedProperty(null);
              setOpenForm(true);
            }}
          >
            {isMobile ? <AddIcon /> : 'הוסף נכס'}
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

      {/* Data Grid (desktop) / Mobile Card List */}
      {isMobile ? (
        <Box sx={{ width: '100%' }}>
          {isLoading ? (
            <Typography sx={{ py: 4, textAlign: 'center' }}>טוען...</Typography>
          ) : (
            <>
              {(data?.data || [])
                .filter((p) => !deletedPropertyIds.has(p.id))
                .map((property) => (
                  <MobilePropertyCard
                    key={property.id}
                    property={property}
                    onView={(id) => router.push(`/properties/${id}`)}
                    onEdit={(p) => {
                      setSelectedProperty(p);
                      setOpenForm(true);
                    }}
                    onDelete={handleDeleteClick}
                  />
                ))}
              {(!data?.data?.length || data.data.every((p) => deletedPropertyIds.has(p.id))) && !isLoading && (
                <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  לא נמצאו נכסים
                </Typography>
              )}
              {/* Mobile pagination - simple prev/next */}
              {data?.meta && data.meta.total > pageSize && (
                <Stack direction="row" justifyContent="center" gap={1} sx={{ mt: 2, mb: 2 }}>
                  <Button
                    size="small"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    הקודם
                  </Button>
                  <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                    {page} / {Math.ceil((data.meta.total - deletedPropertyIds.size) / pageSize) || 1}
                  </Typography>
                  <Button
                    size="small"
                    disabled={page >= Math.ceil((data.meta.total - deletedPropertyIds.size) / pageSize)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    הבא
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Box>
      ) : (
        <Box sx={{
          height: 600,
          width: '100%',
          '& .row-deleted': {
            color: 'text.disabled',
            textDecoration: 'line-through',
            bgcolor: 'action.hover',
            opacity: 0.6,
          },
        }}>
          <DataGrid
            key={`properties-grid-${page}-${data?.meta.total || 0}-${data?.data?.length || 0}-${deletedPropertyIds.size}`}
            rows={filteredRows}
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
            getRowClassName={(params) => params.row.deletedAt ? 'row-deleted' : ''}
            // disableColumnReorder removed (not supported in this DataGrid version)
          />
        </Box>
      )}

      {/* Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
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
            האם אתה בטוח שברצונך למחוק את הנכס <strong>"{propertyToDelete?.address}"</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            הנכס יסומן כמחוק יחד עם הבעלויות, המשכנתאות, חוזי השכירות והאירועים הקשורים אליו. מנהל מערכת יכול לשחזר אותו בהגדרות.
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

      {isMobile && (
        <Fab
          color="primary"
          aria-label="הוסף נכס"
          sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1200 }}
          onClick={() => {
            setSelectedProperty(null);
            setOpenForm(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
