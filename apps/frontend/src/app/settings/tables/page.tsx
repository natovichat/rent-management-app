'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TableChart as TableIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ENTITY_TYPES, ENTITY_DISPLAY_NAMES, EntityType } from '@/types/table-config';
import { useTableConfigurations } from '@/lib/hooks/useTableConfigurations';

/**
 * Table settings main page - list of all entities
 */
export default function TableSettingsPage() {
  const router = useRouter();
  const { data: configurations, isLoading, error } = useTableConfigurations();

  /**
   * Get configuration status for entity
   */
  const getConfigStatus = (entityType: EntityType): 'custom' | 'default' => {
    const config = configurations?.find((c) => c.entityType === entityType);
    return config ? 'custom' : 'default';
  };

  /**
   * Get column count for entity
   */
  const getColumnCount = (entityType: EntityType): number | null => {
    const config = configurations?.find((c) => c.entityType === entityType);
    if (!config) return null;
    return config.columns.filter((c) => c.visible).length;
  };

  /**
   * Navigate to entity configuration page
   */
  const handleEntityClick = (entityType: EntityType) => {
    router.push(`/settings/tables/${entityType}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} href="/" underline="hover" color="inherit">
          בית
        </MuiLink>
        <MuiLink component={Link} href="/settings" underline="hover" color="inherit">
          הגדרות
        </MuiLink>
        <Typography color="text.primary">הגדרות טבלאות</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1">
            הגדרות טבלאות
          </Typography>
          <Typography variant="body2" color="text.secondary">
            קבע אילו עמודות יוצגו בכל טבלה ובאיזה סדר
          </Typography>
        </Box>
      </Box>

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת הגדרות. אנא נסה שוב.
        </Alert>
      )}

      {/* Entity list */}
      {!isLoading && !error && (
        <Paper>
          <List sx={{ p: 0 }}>
            {ENTITY_TYPES.map((entityType, index) => {
              const status = getConfigStatus(entityType);
              const columnCount = getColumnCount(entityType);

              return (
                <ListItem
                  key={entityType}
                  disablePadding
                  divider={index < ENTITY_TYPES.length - 1}
                >
                  <ListItemButton onClick={() => handleEntityClick(entityType)} sx={{ py: 2 }}>
                    <ListItemIcon>
                      <TableIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {ENTITY_DISPLAY_NAMES[entityType]}
                          </Typography>
                          {status === 'custom' && (
                            <Chip label="מותאם אישית" size="small" color="primary" />
                          )}
                          {status === 'default' && (
                            <Chip label="ברירת מחדל" size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        columnCount !== null
                          ? `${columnCount} עמודות מוצגות`
                          : 'לחץ כדי להתאים אישית'
                      }
                    />
                    <ChevronLeftIcon />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Info box */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          ℹ️ מידע חשוב
        </Typography>
        <Typography variant="body2">
          • השינויים חלים על כל המשתמשים במערכת
          <br />
          • עמודות שמסומנות כ&quot;חובה&quot; לא ניתנות להסתרה
          <br />
          • אם לא הוגדרו הגדרות מותאמות, המערכת תשתמש בברירת המחדל
          <br />• ניתן לאפס כל טבלה לברירת המחדל בכל עת
        </Typography>
      </Alert>
    </Container>
  );
}
