import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { COLUMN_LABELS } from '@/types/table-config-labels';

/**
 * Generate dynamic columns for DataGrid based on field names
 * 
 * This utility creates GridColDef objects dynamically based on:
 * - Field name and type
 * - Hebrew labels from COLUMN_LABELS
 * - Smart rendering based on field type (boolean, date, number, etc.)
 */
export function generatePropertyColumns<T extends GridValidRowModel = any>(
  fields: string[],
  onRowClick?: (id: string) => void
): GridColDef<T>[] {
  return fields.map((field): GridColDef<T> => {
    const label = COLUMN_LABELS[field] || field;
    const baseColumn: GridColDef<T> = {
      field,
      headerName: label,
      renderHeader: () => (
        <Box sx={{ 
          width: '100% !important', 
          textAlign: 'right !important', 
          direction: 'rtl !important',
          display: 'flex !important',
          justifyContent: 'flex-end !important',
        }}>
          {label}
        </Box>
      ),
    };

    // Special handling for specific fields
    switch (field) {
      // Primary identifier - clickable and flexible width
      case 'address':
        return {
          ...baseColumn,
          flex: 1,
          minWidth: 250,
          align: 'right',
          headerAlign: 'right',
          hideable: false,
          disableColumnMenu: true,
          renderCell: (params) => (
            <Box 
              sx={{ 
                textAlign: 'right', 
                width: '100%',
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? {
                  textDecoration: 'underline',
                  color: 'primary.main',
                } : {}
              }}
              onClick={() => onRowClick?.(params.row.id)}
            >
              {params.value}
            </Box>
          ),
        };

      // Boolean fields
      case 'isMortgaged':
        return {
          ...baseColumn,
          width: 130,
          align: 'center',
          headerAlign: 'center',
          type: 'boolean',
          renderHeader: () => (
            <Box sx={{ 
              width: '100% !important', 
              textAlign: 'center !important', 
              display: 'flex !important',
              justifyContent: 'center !important',
            }}>
              {label}
            </Box>
          ),
          renderCell: (params) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {params.value ? (
                <Chip
                  label="משועבד"
                  size="small"
                  color="warning"
                  icon={<AccountBalanceIcon />}
                />
              ) : null}
            </Box>
          ),
        };

      case 'isSold':
      case 'isPartialOwnership':
      case 'storage':
        return {
          ...baseColumn,
          width: 100,
          align: 'center',
          headerAlign: 'center',
          type: 'boolean',
          renderHeader: () => (
            <Box sx={{ 
              width: '100% !important', 
              textAlign: 'center !important', 
              display: 'flex !important',
              justifyContent: 'center !important',
            }}>
              {label}
            </Box>
          ),
          renderCell: (params) => (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              {params.value ? '✓' : '-'}
            </Box>
          ),
        };

      // Date fields
      case 'createdAt':
      case 'updatedAt':
      case 'acquisitionDate':
      case 'registrationDate':
      case 'saleDate':
      case 'lastTaxPayment':
      case 'insuranceExpiry':
      case 'lastValuationDate':
        return {
          ...baseColumn,
          width: 150,
          type: 'date',
          align: 'right',
          headerAlign: 'right',
          valueFormatter: (params) => {
            if (!params.value) return '-';
            try {
              return new Date(params.value).toLocaleDateString('he-IL');
            } catch {
              return '-';
            }
          },
          renderCell: (params) => (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              {params.value || '-'}
            </Box>
          ),
        };

      // Numeric fields with currency
      case 'estimatedValue':
      case 'acquisitionPrice':
      case 'projectedValue':
      case 'rentalIncome':
      case 'managementFees':
      case 'taxAmount':
      case 'salePrice':
        return {
          ...baseColumn,
          width: 150,
          type: 'number',
          align: 'right',
          headerAlign: 'right',
          valueFormatter: (params) => {
            if (params.value == null) return '-';
            return new Intl.NumberFormat('he-IL', {
              style: 'currency',
              currency: 'ILS',
              maximumFractionDigits: 0,
            }).format(params.value);
          },
          renderCell: (params) => (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              {params.value != null ? params.value.toLocaleString('he-IL') : '-'}
            </Box>
          ),
        };

      // Numeric fields (general)
      case 'totalArea':
      case 'landArea':
      case 'balconyArea':
      case 'plotSize':
      case 'floors':
      case 'totalUnits':
      case 'parkingSpaces':
      case 'floor':
      case 'constructionYear':
      case 'lastRenovationYear':
      case 'sharedOwnershipPercentage':
      case 'expectedCompletionYears':
        return {
          ...baseColumn,
          width: 120,
          type: 'number',
          align: 'center',
          headerAlign: 'center',
          renderHeader: () => (
            <Box sx={{ 
              width: '100% !important', 
              textAlign: 'center !important', 
              display: 'flex !important',
              justifyContent: 'center !important',
            }}>
              {label}
            </Box>
          ),
          renderCell: (params) => (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              {params.value != null ? params.value.toLocaleString('he-IL') : '-'}
            </Box>
          ),
        };

      // Special handling for gush/helka combination
      case 'gush':
      case 'helka':
        return {
          ...baseColumn,
          width: 100,
          align: 'center',
          headerAlign: 'center',
          renderHeader: () => (
            <Box sx={{ 
              width: '100% !important', 
              textAlign: 'center !important', 
              display: 'flex !important',
              justifyContent: 'center !important',
            }}>
              {label}
            </Box>
          ),
          renderCell: (params) => (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              {params.value || '-'}
            </Box>
          ),
        };

      // Text fields - default
      default:
        return {
          ...baseColumn,
          width: 150,
          align: 'right',
          headerAlign: 'right',
          renderCell: (params) => (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              {params.value || '-'}
            </Box>
          ),
        };
    }
  });
}
