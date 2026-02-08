'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Switch,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EntityType, ENTITY_DISPLAY_NAMES, ColumnConfig } from '@/types/table-config';
import { COLUMN_LABELS, COLUMN_GROUPS } from '@/types/table-config-labels';
import {
  useTableConfiguration,
  useUpsertTableConfiguration,
  useResetTableConfiguration,
} from '@/lib/hooks/useTableConfigurations';

/**
 * Build default column configurations from COLUMN_GROUPS
 * These are used as fallback if no custom configuration exists
 */
const buildDefaultColumns = (entityType: EntityType): ColumnConfig[] => {
  const groups = COLUMN_GROUPS[entityType] || [];
  const columns: ColumnConfig[] = [];
  let order = 0;

  groups.forEach((group) => {
    group.fields.forEach((field, index) => {
      // First field in first group is required (usually the primary identifier)
      const isFirstField = order === 0;
      columns.push({
        field,
        visible: true,
        order: order++,
        required: isFirstField,
      });
    });
  });

  return columns;
};

/**
 * Default column configurations for each entity type
 */
const DEFAULT_COLUMNS: Record<EntityType, ColumnConfig[]> = {
  properties: buildDefaultColumns('properties'),
  tenants: buildDefaultColumns('tenants'),
  leases: buildDefaultColumns('leases'),
  units: buildDefaultColumns('units'),
  expenses: buildDefaultColumns('expenses'),
  income: buildDefaultColumns('income'),
  owners: buildDefaultColumns('owners'),
  ownerships: buildDefaultColumns('ownerships'),
  bankAccounts: buildDefaultColumns('bankAccounts'),
  mortgages: buildDefaultColumns('mortgages'),
};

interface PageProps {
  params: { entityType: EntityType };
}

/**
 * Edit table configuration for specific entity type
 */
export default function EditTableConfigPage({ params }: PageProps) {
  const entityType = params.entityType;
  const router = useRouter();

  const { data: config, isLoading, error } = useTableConfiguration(entityType);
  const upsertMutation = useUpsertTableConfiguration();
  const resetMutation = useResetTableConfiguration();

  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Initialize columns from config or defaults
   */
  useEffect(() => {
    if (config?.columns) {
      setColumns([...config.columns].sort((a, b) => a.order - b.order));
    } else {
      setColumns(DEFAULT_COLUMNS[entityType] || []);
    }
    setHasChanges(false);
  }, [config, entityType]);

  /**
   * Toggle column visibility
   */
  const handleToggleVisibility = (field: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.field === field ? { ...col, visible: !col.visible } : col)),
    );
    setHasChanges(true);
  };

  /**
   * Move column up
   */
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...columns];
    [newColumns[index - 1], newColumns[index]] = [newColumns[index], newColumns[index - 1]];
    // Update order numbers
    newColumns.forEach((col, i) => {
      col.order = i;
    });
    setColumns(newColumns);
    setHasChanges(true);
  };

  /**
   * Move column down
   */
  const handleMoveDown = (index: number) => {
    if (index === columns.length - 1) return;
    const newColumns = [...columns];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    // Update order numbers
    newColumns.forEach((col, i) => {
      col.order = i;
    });
    setColumns(newColumns);
    setHasChanges(true);
  };

  /**
   * Save configuration
   */
  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        entityType,
        columns,
      });
      setHasChanges(false);
      alert('ההגדרות נשמרו בהצלחה!');
    } catch (err) {
      alert('שגיאה בשמירת ההגדרות');
    }
  };

  /**
   * Reset to defaults
   */
  const handleReset = async () => {
    if (confirm('האם אתה בטוח שברצונך לאפס לברירת מחדל?')) {
      try {
        await resetMutation.mutateAsync(entityType);
        setColumns(DEFAULT_COLUMNS[entityType] || []);
        setHasChanges(false);
        alert('ההגדרות אופסו לברירת המחדל!');
      } catch (err) {
        alert('שגיאה באיפוס ההגדרות');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} href="/" underline="hover" color="inherit">
          בית
        </MuiLink>
        <MuiLink component={Link} href="/settings" underline="hover" color="inherit">
          הגדרות
        </MuiLink>
        <MuiLink component={Link} href="/settings/tables" underline="hover" color="inherit">
          הגדרות טבלאות
        </MuiLink>
        <Typography color="text.primary">{ENTITY_DISPLAY_NAMES[entityType]}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.back()}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {ENTITY_DISPLAY_NAMES[entityType]}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            אפס
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || upsertMutation.isPending}
          >
            {upsertMutation.isPending ? 'שומר...' : 'שמור'}
          </Button>
        </Box>
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת ההגדרות
        </Alert>
      )}

      {/* Columns list - organized by groups */}
      {!isLoading && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {COLUMN_GROUPS[entityType]?.map((group) => {
            // Get columns for this group
            const groupColumns = columns.filter((col) =>
              group.fields.includes(col.field)
            );

            if (groupColumns.length === 0) return null;

            return (
              <Paper key={group.label} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {group.label}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {groupColumns.map((column) => {
                  const columnIndex = columns.findIndex((c) => c.field === column.field);
                  return (
                    <Box
                      key={column.field}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {/* Move buttons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveUp(columnIndex)}
                          disabled={columnIndex === 0}
                        >
                          <UpIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDown(columnIndex)}
                          disabled={columnIndex === columns.length - 1}
                        >
                          <DownIcon />
                        </IconButton>
                      </Box>

                      {/* Column info */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {COLUMN_LABELS[column.field] || column.field}
                          </Typography>
                          {column.required && (
                            <Chip
                              icon={<LockIcon />}
                              label="חובה"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          שם שדה: {column.field} • סדר: {column.order + 1}
                        </Typography>
                      </Box>

                      {/* Visibility toggle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {column.visible ? 'מוצג' : 'מוסתר'}
                        </Typography>
                        <Switch
                          checked={column.visible}
                          onChange={() => handleToggleVisibility(column.field)}
                          disabled={column.required}
                          color="primary"
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          • העמודות מאורגנות לפי קבוצות כפי שמופיעות בטופס העריכה
          <br />
          • השתמש בחצים למעלה/למטה כדי לשנות את סדר העמודות (גם בין קבוצות)
          <br />
          • השתמש במתג כדי להציג/להסתיר עמודות
          <br />
          • עמודות המסומנות כ&quot;חובה&quot; לא ניתנות להסתרה
          <br />
          • לחץ על &quot;שמור&quot; כדי לשמור את השינויים לכל המשתמשים
          <br />• ניתן לאפס את ההגדרות לברירת המחדל בכל עת
        </Typography>
      </Alert>
    </Container>
  );
}
