/**
 * PropertyCard - Enhanced property display with visual indicators
 * 
 * Features:
 * - Status badges (OWNED, IN_CONSTRUCTION, etc.)
 * - Country flags for international properties
 * - Quick stats (area, value, owners)
 * - Visual indicators (mortgage, leased, plot info)
 * - Quick actions
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  BarChart as ChartIcon,
  MoreVert as MoreIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  AccountBalance as BankIcon,
  Description as ContractIcon,
  Map as MapIcon,
} from '@mui/icons-material';

// Types
interface PropertyOwnership {
  id: string;
  ownershipPercentage: number;
  owner: {
    id: string;
    name: string;
  };
}

interface PlotInfo {
  gush: string;
  chelka: string;
}

interface Property {
  id: string;
  address: string;
  city?: string;
  country: string;
  type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'MIXED_USE';
  status?: 'OWNED' | 'IN_CONSTRUCTION' | 'IN_PURCHASE' | 'SOLD' | 'INVESTMENT';
  totalArea?: number;
  estimatedValue?: number;
  ownerships?: PropertyOwnership[];
  plotInfo?: PlotInfo;
  _count?: {
    mortgages: number;
    units: number;
  };
  hasActiveLease?: boolean;
}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onViewReport?: (property: Property) => void;
  onMore?: (property: Property) => void;
}

// Helper functions
const getStatusColor = (status?: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'OWNED':
      return 'success';
    case 'IN_CONSTRUCTION':
      return 'warning';
    case 'IN_PURCHASE':
      return 'primary';
    case 'SOLD':
      return 'default';
    case 'INVESTMENT':
      return 'primary';
    default:
      return 'default';
  }
};

const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'OWNED':
      return 'בבעלות';
    case 'IN_CONSTRUCTION':
      return 'בבנייה';
    case 'IN_PURCHASE':
      return 'בהליכי רכישה';
    case 'SOLD':
      return 'נמכר';
    case 'INVESTMENT':
      return 'השקעה';
    default:
      return 'לא ידוע';
  }
};

const getTypeLabel = (type?: string): string => {
  switch (type) {
    case 'RESIDENTIAL':
      return 'מגורים';
    case 'COMMERCIAL':
      return 'מסחרי';
    case 'LAND':
      return 'קרקע';
    case 'MIXED_USE':
      return 'שימוש מעורב';
    default:
      return '';
  }
};

const formatCurrency = (value?: number): string => {
  if (!value) return '-';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

const getCountryFlag = (country: string): string => {
  const flagMap: Record<string, string> = {
    Israel: '🇮🇱',
    Germany: '🇩🇪',
    USA: '🇺🇸',
    France: '🇫🇷',
    UK: '🇬🇧',
  };
  return flagMap[country] || '🌍';
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onViewReport,
  onMore,
}) => {
  const hasMortgage = property._count?.mortgages && property._count.mortgages > 0;
  const ownerCount = property.ownerships?.length || 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {property.status && (
            <Chip
              label={getStatusLabel(property.status)}
              color={getStatusColor(property.status)}
              size="small"
            />
          )}
          {property.country !== 'Israel' && (
            <Tooltip title={property.country}>
              <Typography variant="h6" component="span">
                {getCountryFlag(property.country)}
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {/* Address */}
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {property.address}
        </Typography>

        {/* City & Type */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          {property.city && (
            <Typography variant="body2" color="text.secondary">
              {property.city}
            </Typography>
          )}
          {property.type && (
            <>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getTypeLabel(property.type)}
              </Typography>
            </>
          )}
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {property.totalArea && (
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <HomeIcon color="action" fontSize="small" />
                <Typography variant="body2" fontWeight="600">
                  {property.totalArea}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  מ״ר
                </Typography>
              </Box>
            </Grid>
          )}
          {property.estimatedValue && (
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <MoneyIcon color="action" fontSize="small" />
                <Typography variant="body2" fontWeight="600" noWrap>
                  {formatCurrency(property.estimatedValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  שווי
                </Typography>
              </Box>
            </Grid>
          )}
          {ownerCount > 0 && (
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <PeopleIcon color="action" fontSize="small" />
                <Typography variant="body2" fontWeight="600">
                  {ownerCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  בעלים
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Visual Indicators */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {hasMortgage && (
            <Chip
              icon={<BankIcon />}
              label="משכנתא"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {property.hasActiveLease && (
            <Chip
              icon={<ContractIcon />}
              label="מושכר"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {property.plotInfo && (
            <Chip
              icon={<MapIcon />}
              label={`גוש ${property.plotInfo.gush}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Tooltip title="עריכה">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(property)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onViewReport && (
            <Tooltip title="דוח כספי">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onViewReport(property)}
              >
                <ChartIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {onMore && (
          <Tooltip title="עוד">
            <IconButton
              size="small"
              onClick={() => onMore(property)}
            >
              <MoreIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default PropertyCard;
