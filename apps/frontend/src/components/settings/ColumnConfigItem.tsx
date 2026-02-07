import { Box, Paper, Typography, Switch, IconButton, Chip } from '@mui/material';
import { DragIndicator as DragIcon, Lock as LockIcon } from '@mui/icons-material';
import { ColumnConfig } from '@/types/table-config';

interface ColumnConfigItemProps {
  column: ColumnConfig;
  onToggleVisibility: (field: string) => void;
  isDragging?: boolean;
}

/**
 * Single column configuration item
 * Can be dragged to reorder, and toggled for visibility
 */
export default function ColumnConfigItem({
  column,
  onToggleVisibility,
  isDragging = false,
}: ColumnConfigItemProps) {
  const handleToggle = () => {
    if (!column.required) {
      onToggleVisibility(column.field);
    }
  };

  return (
    <Paper
      elevation={isDragging ? 8 : 1}
      sx={{
        p: 2,
        mb: 1.5,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          elevation: 3,
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Drag handle */}
        <DragIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />

        {/* Column info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {column.field}
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
            סדר: {column.order + 1}
          </Typography>
        </Box>

        {/* Visibility toggle */}
        <Box>
          <Switch
            checked={column.visible}
            onChange={handleToggle}
            disabled={column.required}
            color="primary"
          />
          <Typography variant="caption" color="text.secondary">
            {column.visible ? 'מוצג' : 'מוסתר'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
