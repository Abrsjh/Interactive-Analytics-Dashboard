import React, { ReactNode } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Info as InfoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  height?: number | string;
  isLoading?: boolean;
  error?: string | null;
  showRefresh?: boolean;
  showExport?: boolean;
  showZoom?: boolean;
  showInfo?: boolean;
  infoTooltip?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  children: ReactNode;
  actionButtons?: ReactNode;
}

/**
 * A reusable wrapper component for charts that provides consistent styling and functionality
 * such as loading states, error handling, and common actions like refresh and export.
 */
const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  height = 300,
  isLoading = false,
  error = null,
  showRefresh = true,
  showExport = true,
  showZoom = false,
  showInfo = false,
  infoTooltip = 'Chart information',
  onRefresh,
  onExport,
  onZoomIn,
  onZoomOut,
  children,
  actionButtons,
}) => {
  const theme = useTheme();

  // Handle refresh click
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  // Handle export click
  const handleExport = () => {
    if (onExport) onExport();
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (onZoomIn) onZoomIn();
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (onZoomOut) onZoomOut();
  };

  return (
    <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {showInfo && (
              <Tooltip title={infoTooltip}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {showZoom && (
              <>
                <Tooltip title="Zoom In">
                  <IconButton size="small" onClick={handleZoomIn}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={handleZoomOut}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {showRefresh && (
              <Tooltip title="Refresh Data">
                <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {showExport && (
              <Tooltip title="Export Data">
                <IconButton size="small" onClick={handleExport}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {actionButtons}
            <Tooltip title="More Options">
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1, position: 'relative', p: { xs: 1, sm: 2 } }}>
        {isLoading ? (
          <Skeleton variant="rectangular" height={height} animation="wave" />
        ) : error ? (
          <Box
            sx={{
              height: height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              p: 2,
            }}
          >
            <Typography color="error" gutterBottom>
              Error loading chart data
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {error}
            </Typography>
            {showRefresh && (
              <Box mt={2}>
                <Tooltip title="Try Again">
                  <IconButton color="primary" onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ height: height, width: '100%' }}>{children}</Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;