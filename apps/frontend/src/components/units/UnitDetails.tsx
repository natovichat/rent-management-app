'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { unitsApi, Unit } from '@/services/units';
import { format } from 'date-fns';
import { he } from 'date-fns/locale/he';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface UnitDetailsProps {
  unitId: string;
  onClose: () => void;
  onEdit?: (unit: Unit) => void;
  onDelete?: (unit: Unit) => void;
}

export default function UnitDetails({ unitId, onClose, onEdit, onDelete }: UnitDetailsProps) {
  const router = useRouter();
  const { data: unit, isLoading, error } = useQuery({
    queryKey: ['units', unitId],
    queryFn: () => unitsApi.getOne(unitId),
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !unit) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          שגיאה בטעינת פרטי הדירה
        </Alert>
        <DialogActions>
          <Button onClick={onClose}>סגור</Button>
        </DialogActions>
      </Box>
    );
  }

  const activeLease = unit.leases.find((lease) => lease.status === 'ACTIVE');

  return (
    <>
      <DialogTitle>פרטי דירה</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Unit Information */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              פרטי הדירה
            </Typography>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  נכס
                </Typography>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => {
                    onClose();
                    router.push(`/properties/${unit.property.id}`);
                  }}
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' },
                    cursor: 'pointer',
                    textAlign: 'right',
                    p: 0,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  {unit.property.address}
                  {unit.property.fileNumber && (
                    <span style={{ color: '#666', marginRight: '8px' }}>
                      {' '}
                      ({unit.property.fileNumber})
                    </span>
                  )}
                </Link>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  מספר דירה
                </Typography>
                <Typography variant="body1">{unit.apartmentNumber}</Typography>
              </Box>

              {unit.floor !== null && unit.floor !== undefined && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    קומה
                  </Typography>
                  <Typography variant="body1">{unit.floor}</Typography>
                </Box>
              )}

              {unit.roomCount !== null && unit.roomCount !== undefined && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    מספר חדרים
                  </Typography>
                  <Typography variant="body1">{unit.roomCount}</Typography>
                </Box>
              )}

              {unit.notes && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    הערות
                  </Typography>
                  <Typography variant="body1">{unit.notes}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  תאריך יצירה
                </Typography>
                <Typography variant="body1">
                  {format(new Date(unit.createdAt), 'dd/MM/yyyy', {
                    locale: he,
                  })}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Active Lease Information */}
          {activeLease ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                חוזה שכירות פעיל
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    שוכר
                  </Typography>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => {
                          onClose();
                          router.push(`/leases/${activeLease.id}`);
                        }}
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          cursor: 'pointer',
                          textAlign: 'right',
                          p: 0,
                          border: 'none',
                          background: 'none',
                        }}
                      >
                        {activeLease.tenant.name}
                      </Link>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    תאריך התחלה
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(activeLease.startDate), 'dd/MM/yyyy', {
                      locale: he,
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    תאריך סיום
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(activeLease.endDate), 'dd/MM/yyyy', {
                      locale: he,
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    סטטוס
                  </Typography>
                  <Chip
                    label={
                      activeLease.status === 'ACTIVE'
                        ? 'פעיל'
                        : activeLease.status
                    }
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                אין חוזה שכירות פעיל לדירה זו
              </Typography>
            </Paper>
          )}

          {/* All Leases */}
          {unit.leases.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                כל החוזים ({unit.leases.length})
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {unit.leases.map((lease) => (
                  <Box
                    key={lease.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => {
                          onClose();
                          router.push(`/leases/${lease.id}`);
                        }}
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          cursor: 'pointer',
                          textAlign: 'right',
                          p: 0,
                          border: 'none',
                          background: 'none',
                        }}
                      >
                        {lease.tenant.name}
                      </Link>
                      <Chip
                        label={
                          lease.status === 'ACTIVE'
                            ? 'פעיל'
                            : lease.status === 'EXPIRED'
                              ? 'פג תוקף'
                              : lease.status === 'FUTURE'
                                ? 'עתידי'
                                : lease.status
                        }
                        color={
                          lease.status === 'ACTIVE'
                            ? 'success'
                            : lease.status === 'EXPIRED'
                              ? 'error'
                              : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(lease.startDate), 'dd/MM/yyyy', {
                        locale: he,
                      })}{' '}
                      -{' '}
                      {format(new Date(lease.endDate), 'dd/MM/yyyy', {
                        locale: he,
                      })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        {onDelete && (
          <Button
            onClick={() => {
              onDelete(unit);
              onClose();
            }}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            aria-label="מחיקה"
          >
            מחיקה
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={() => {
              onEdit(unit);
              onClose();
            }}
            variant="outlined"
            startIcon={<EditIcon />}
            aria-label="עריכה"
          >
            עריכה
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          סגור
        </Button>
      </DialogActions>
    </>
  );
}
