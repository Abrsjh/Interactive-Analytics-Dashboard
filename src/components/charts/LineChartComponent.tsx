import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import ChartWrapper from './ChartWrapper';

// Types
export interface DataPoint {
  [key: string]: any;
  date?: string;
  name?: string;
}

export interface SeriesConfig {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter' | 'basis' | 'basisOpen' | 'basisClosed' | 'natural';
  dot?: boolean | object;
  activeDot?: boolean | object;
  isAnimationActive?: boolean;
  unit?: string;
}

export interface AxisConfig {
  dataKey?: string;
  tickFormatter?: (value: any) => string;
  domain?: [number | string | 'auto', number | string | 'auto'];
  allowDecimals?: boolean;
  hide?: boolean;
  label?: string | object;
  scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
  padding?: { left?: number; right?: number; top?: number; bottom?: number };
  minTickGap?: number;
  angle?: number;
  interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
  textAnchor?: string;
  height?: number;
}

export interface LineChartProps {
  data: DataPoint[];
  series: SeriesConfig[];
  title: string;
  subtitle?: string;
  height?: number;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  isLoading?: boolean;
  error?: string | null;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showZoom?: boolean;
  allowPanning?: boolean;
  referenceLines?: {
    x?: string | number;
    y?: number;
    label?: string;
    color?: string;
  }[];
  referenceAreas?: {
    x1: string | number;
    x2: string | number;
    y1?: number;
    y2?: number;
    label?: string;
    fill?: string;
    fillOpacity?: number;
  }[];
  onRefresh?: () => void;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tooltipLabelFormatter?: (label: any) => string;
  tooltipContent?: React.ReactElement | ((props: TooltipProps<any, any>) => React.ReactElement);
  syncId?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A reusable line chart component built on Recharts with consistent styling and extended functionality
 */
const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 300,
  xAxis = {},
  yAxis = {},
  isLoading = false,
  error = null,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showZoom = false,
  allowPanning = false,
  referenceLines = [],
  referenceAreas = [],
  onRefresh,
  tooltipFormatter,
  tooltipLabelFormatter,
  tooltipContent,
  syncId,
  className,
  style,
}) => {
  const theme = useTheme();

  // Default X and Y axis configurations
  const defaultXAxis: AxisConfig = {
    dataKey: 'date',
    interval: 'preserveStartEnd',
    angle: 0,
    tickFormatter: (value) => value?.toString() || '',
    ...xAxis,
  };

  const defaultYAxis: AxisConfig = {
    allowDecimals: true,
    tickFormatter: (value) => value?.toString() || '',
    ...yAxis,
  };

  // Customize stroke colors based on theme if not provided
  const getSeriesWithColors = () => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];

    return series.map((item, index) => ({
      ...item,
      color: item.color || colors[index % colors.length],
    }));
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" gutterBottom>
          {tooltipLabelFormatter ? tooltipLabelFormatter(label) : label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={`tooltip-item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 12,
                height: 12,
                mr: 1,
                bgcolor: entry.color,
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" component="span" fontWeight="bold">
              {tooltipFormatter
                ? tooltipFormatter(entry.value, entry.name, entry)[0]
                : entry.value}
              {entry.unit || ''}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  // Export data to CSV
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Get all the headers
    const headers = ['date'];
    series.forEach((s) => headers.push(s.dataKey));

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    data.forEach((row) => {
      const rowValues = headers.map((header) => {
        const value = row[header];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvContent += rowValues.join(',') + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const coloredSeries = getSeriesWithColors();

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      height={height}
      isLoading={isLoading}
      error={error}
      showRefresh={!!onRefresh}
      showExport={true}
      showZoom={showZoom}
      onRefresh={onRefresh}
      onExport={handleExport}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={300} aspect={16/9}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          syncId={syncId}
          className={className}
          style={style}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />}
          
          <XAxis
            dataKey={defaultXAxis.dataKey}
            tickFormatter={defaultXAxis.tickFormatter}
            domain={defaultXAxis.domain}
            allowDecimals={defaultXAxis.allowDecimals}
            hide={defaultXAxis.hide}
            label={defaultXAxis.label}
            scale={defaultXAxis.scale}
            padding={defaultXAxis.padding}
            minTickGap={defaultXAxis.minTickGap}
            angle={defaultXAxis.angle}
            interval={defaultXAxis.interval}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          
          <YAxis
            tickFormatter={defaultYAxis.tickFormatter}
            domain={defaultYAxis.domain}
            allowDecimals={defaultYAxis.allowDecimals}
            hide={defaultYAxis.hide}
            label={defaultYAxis.label}
            scale={defaultYAxis.scale}
            padding={defaultYAxis.padding}
            minTickGap={defaultYAxis.minTickGap}
            interval={defaultYAxis.interval}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          
          {showTooltip && (
            tooltipContent ? (
              <Tooltip content={tooltipContent} />
            ) : (
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
                content={<CustomTooltip />}
                cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
              />
            )
          )}
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
          )}
          
          {/* Reference Lines */}
          {referenceLines.map((line, index) => (
            <ReferenceLine
              key={`ref-line-${index}`}
              x={line.x}
              y={line.y}
              stroke={line.color || theme.palette.divider}
              strokeDasharray="3 3"
              label={{
                value: line.label || '',
                position: 'insideTopRight',
                fill: theme.palette.text.secondary,
                fontSize: 12,
              }}
            />
          ))}
          
          {/* Reference Areas */}
          {referenceAreas.map((area, index) => (
            <ReferenceArea
              key={`ref-area-${index}`}
              x1={area.x1}
              x2={area.x2}
              y1={area.y1}
              y2={area.y2}
              fill={area.fill || theme.palette.action.hover}
              fillOpacity={area.fillOpacity || 0.1}
              stroke={theme.palette.divider}
              label={{
                value: area.label || '',
                position: 'insideTopRight',
                fill: theme.palette.text.secondary,
                fontSize: 12,
              }}
            />
          ))}
          
          {/* Line Series */}
          {coloredSeries.map((s, index) => (
            <Line
              key={`line-${index}`}
              type={s.type || 'monotone'}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              strokeDasharray={s.strokeDasharray}
              dot={s.dot !== undefined ? s.dot : { r: 2 }}
              activeDot={s.activeDot !== undefined ? s.activeDot : { r: 5 }}
              isAnimationActive={s.isAnimationActive !== undefined ? s.isAnimationActive : true}
              unit={s.unit}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default LineChartComponent;