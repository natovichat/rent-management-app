/**
 * OwnershipPanel - Visual ownership management with pie chart and table
 * 
 * Features:
 * - Pie chart showing ownership distribution
 * - Detailed owners table
 * - Add/edit/delete owners
 * - Validation (ownership must = 100%)
 * - Avatar display
 * - Ownership type badges
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  Chip,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

// Types
interface Owner {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP';
  email?: string;
  phone?: string;
  idNumber?: string;
}

interface PropertyOwnership {
  id: string;
  ownerId: string;
  ownershipPercentage: number;
  ownershipType: 'FULL' | 'PARTIAL' | 'PARTNERSHIP' | 'COMPANY';
  startDate: string;
  endDate?: string;
  notes?: string;
  owner: Owner;
}

interface OwnershipPanelProps {
  propertyId: string;
  ownerships: PropertyOwnership[];
  onAddOwnership?: () => void;
  onEditOwnership?: (ownership: PropertyOwnership) => void;
  onDeleteOwnership?: (ownershipId: string) => void;
}

// Chart colors
const COLORS = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6', '#3498DB'];

// Helper functions
const getOwnerTypeIcon = (type: string) => {
  switch (type) {
    case 'COMPANY':
      return <BusinessIcon fontSize="small" />;
    case 'PARTNERSHIP':
      return <GroupIcon fontSize="small" />;
    default:
      return <PersonIcon fontSize="small" />;
  }
};

const getOwnerTypeLabel = (type: string): string => {
  switch (type) {
    case 'INDIVIDUAL':
      return 'יחיד';
    case 'COMPANY':
      return 'חברה';
    case 'PARTNERSHIP':
      return 'שותפות';
    default:
      return type;
  }
};

const getOwnershipTypeLabel = (type: string): string => {
  switch (type) {
    case 'FULL':
      return 'בעלות מלאה';
    case 'PARTIAL':
      return 'בעלות חלקית';
    case 'PARTNERSHIP':
      return 'שותפות';
    case 'COMPANY':
      return 'חברה';
    default:
      return type;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

export const OwnershipPanel: React.FC<OwnershipPanelProps> = ({
  propertyId,
  ownerships,
  onAddOwnership,
  onEditOwnership,
  onDeleteOwnership,
}) => {
  // Separate active and historical ownerships
  const activeOwnerships = ownerships.filter((o) => !o.endDate);
  const historicalOwnerships = ownerships.filter((o) => o.endDate);

  // Calculate total percentage for active ownerships only
  const totalPercentage = activeOwnerships.reduce(
    (sum, ownership) => sum + Number(ownership.ownershipPercentage),
    0
  );

  const isValidOwnership = totalPercentage === 100;

  // Prepare pie chart data (only active ownerships)
  const chartData = activeOwnerships.map((ownership) => ({
    name: ownership.owner.name,
    value: Number(ownership.ownershipPercentage),
    percentage: `${ownership.ownershipPercentage}%`,
  }));

  // Check if ownership is active
  const isActive = (ownership: PropertyOwnership) => !ownership.endDate;

  return (
    <Box data-testid="ownership-panel">
      {/* Validation Alert */}
      {!isValidOwnership && activeOwnerships.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} data-testid="ownership-validation-warning">
          סך הבעלויות הפעילות חייב להיות 100% (כרגע: {totalPercentage.toFixed(2)}%)
        </Alert>
      )}

      {ownerships.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }} data-testid="ownership-empty-state">
          לא הוגדרו בעלים לנכס זה. הוסף בעלים כדי לנהל את המבנה הבעלותי.
        </Alert>
      )}

      {historicalOwnerships.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          יש {historicalOwnerships.length} בעלויות היסטוריות המוצגות בטבלה למטה
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="התפלגות בעלות" data-testid="ownership-distribution-header" />
            <CardContent>
              {activeOwnerships.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                        }) => {
                          if (!midAngle || !cx || !cy || !innerRadius || !outerRadius) return null;
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor={x > cx ? 'start' : 'end'}
                              dominantBaseline="central"
                              style={{ fontWeight: 'bold' }}
                            >
                              {percent ? `${(percent * 100).toFixed(0)}%` : '0%'}
                            </text>
                          );
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography
                      variant="h6"
                      color={isValidOwnership ? 'success.main' : 'warning.main'}
                    >
                      סה״כ: {totalPercentage.toFixed(2)}%
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    אין נתוני בעלות להצגה
                  </Typography>
                  {onAddOwnership && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={onAddOwnership}
                      sx={{ mt: 2 }}
                    >
                      הוסף בעלים ראשון
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Owners Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="בעלים"
              data-testid="owners-table-header"
              action={
                onAddOwnership && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAddOwnership}
                    size="small"
                  >
                    הוסף בעלים
                  </Button>
                )
              }
            />
            <CardContent sx={{ p: 0 }}>
              {ownerships.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>שם</TableCell>
                        <TableCell>סוג</TableCell>
                        <TableCell align="center">אחוז</TableCell>
                        <TableCell>מתאריך</TableCell>
                        <TableCell>עד תאריך</TableCell>
                        <TableCell align="center">פעולות</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ownerships.map((ownership) => {
                        const active = isActive(ownership);
                        return (
                          <TableRow 
                            key={ownership.id} 
                            hover
                            sx={{
                              opacity: active ? 1 : 0.7,
                              backgroundColor: active ? 'transparent' : 'action.hover',
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: active ? 'primary.main' : 'grey.400' }}>
                                  {ownership.owner.name[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="600">
                                    {ownership.owner.name}
                                    {!active && (
                                      <Chip 
                                        label="היסטורי" 
                                        size="small" 
                                        sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                                        color="default"
                                      />
                                    )}
                                  </Typography>
                                  {ownership.owner.phone && (
                                    <Typography variant="caption" color="text.secondary">
                                      {ownership.owner.phone}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getOwnerTypeIcon(ownership.owner.type)}
                                label={getOwnerTypeLabel(ownership.owner.type)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="h6" color={active ? 'primary' : 'text.secondary'}>
                                {ownership.ownershipPercentage}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(ownership.startDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {ownership.endDate ? (
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(ownership.endDate)}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="success.main" fontWeight="600">
                                  פעיל
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {onEditOwnership && active && (
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEditOwnership(ownership)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}
                                {onDeleteOwnership && active && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDeleteOwnership(ownership.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    אין בעלים להצגה
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnershipPanel;
