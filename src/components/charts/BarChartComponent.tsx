import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  LabelList,
  TooltipProps,
} from 'recharts';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import ChartWrapper from './ChartWrapper';
import { DataPoint, AxisConfig } from './LineChartComponent';

// Types
export interface BarConfig {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
  barSize?: number;
  fillOpacity?: number;
  isAnimationActive?: boolean;
  unit?: string;
  radius?: number | [number, number, number, number];
  showLabel?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom' | 'insideStart' | 'insideEnd';
  labelFormatter?: (value: number) => string;
}

export interface BarChartProps {
  data: DataPoint[];
  bars: BarConfig[];
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
  layout?: 'horizontal' | 'vertical';
  referenceLines?: {
    y?: number;
    x?: string | number;
    label?: string;
    color?: string;
  }[];
  onRefresh?: () => void;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tooltipLabelFormatter?: (label: any) => string;
  tooltipContent?: React.ReactElement | ((props: TooltipProps<any, any>) => React.ReactElement);
  colorByValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A reusable bar chart component built on Recharts with consistent styling and extended functionality
 */
const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  bars,
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
  layout = 'horizontal',
  referenceLines = [],
  onRefresh,
  tooltipFormatter,
  tooltipLabelFormatter,
  tooltipContent,
  colorByValue = false,
  className,
  style,
}) => {
  const theme = useTheme();

  // Determine if the chart is vertical or horizontal
  const isVertical = layout === 'vertical';

  // Default X and Y axis configurations
  const defaultXAxis: AxisConfig = {
    dataKey: 'name',
    interval: 0,
    angle: isVertical ? 0 : -45,
    textAnchor: isVertical ? 'start' : 'end',
    height: isVertical ? 50 : 70,
    tickFormatter: (value) => value?.toString() || '',
    ...xAxis,
  };

  const defaultYAxis: AxisConfig = {
    allowDecimals: false,
    tickFormatter: (value) => value?.toString() || '',
    ...yAxis,
  };

  // Customize bar colors based on theme if not provided
  const getBarsWithColors = () => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];

    return bars.map((item, index) => ({
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
    const headers = ['name'];
    bars.forEach((b) => headers.push(b.dataKey));

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

  // Determine color scales for values (if colorByValue is enabled)
  const getColorForValue = (value: number, barIndex: number) => {
    if (!colorByValue) return undefined;

    const baseColor = theme.palette.primary;
    
    if (value > 0) {
      // Positive values: different shades of success color
      return value > 50 ? theme.palette.success.dark : value > 20 ? theme.palette.success.main : theme.palette.success.light;
    } else if (value < 0) {
      // Negative values: different shades of error color
      return value < -50 ? theme.palette.error.dark : value < -20 ? theme.palette.error.main : theme.palette.error.light;
    }
    
    // Zero or near-zero values
    return theme.palette.grey[400];
  };

  const coloredBars = getBarsWithColors();

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      height={height}
      isLoading={isLoading}
      error={error}
      showRefresh={!!onRefresh}
      showExport={true}
      onRefresh={onRefresh}
      onExport={handleExport}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={300} aspect={16/9}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 20, right: 30, left: 20, bottom: layout === 'horizontal' ? 60 : 20 }}
          className={className}
          style={style}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />}
          
          <XAxis
            {...(isVertical 
              ? { type: 'number' }
              : { 
                  type: 'category',
                  dataKey: defaultXAxis.dataKey,
                  tickFormatter: defaultXAxis.tickFormatter,
                }
            )}
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
            textAnchor={defaultXAxis.textAnchor}
            height={defaultXAxis.height}
          />
          
          <YAxis
            {...(isVertical 
              ? { 
                  type: 'category',
                  dataKey: defaultXAxis.dataKey,
                  tickFormatter: defaultXAxis.tickFormatter,
                }
              : { type: 'number' }
            )}
            tickFormatter={isVertical ? undefined : defaultYAxis.tickFormatter}
            domain={defaultYAxis.domain}
            allowDecimals={defaultYAxis.allowDecimals}
            hide={defaultYAxis.hide}
            label={defaultYAxis.label}
            scale={defaultYAxis.scale}
            padding={defaultYAxis.padding}
            minTickGap={defaultYAxis.minTickGap}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
            width={isVertical ? 120 : undefined}
          />
          
          {showTooltip && (
            tooltipContent ? (
              <Tooltip content={tooltipContent} />
            ) : (
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
                content={<CustomTooltip />}
                cursor={{ fill: theme.palette.action.hover, fillOpacity: 0.3 }}
              />
            )
          )}
          
          {showLegend && coloredBars.length > 1 && (
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
              y={line.y}
              x={line.x}
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
          
          {/* Bars */}
          {coloredBars.map((barConfig, barIndex) => (
            <Bar
              key={`bar-${barIndex}`}
              dataKey={barConfig.dataKey}
              name={barConfig.name}
              fill={barConfig.color}
              fillOpacity={barConfig.fillOpacity || 1}
              stackId={barConfig.stackId}
              barSize={barConfig.barSize}
              isAnimationActive={barConfig.isAnimationActive !== undefined ? barConfig.isAnimationActive : true}
              unit={barConfig.unit}
              radius={barConfig.radius || 0}
            >
              {colorByValue && data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForValue(entry[barConfig.dataKey], barIndex)}
                />
              ))}
              {barConfig.showLabel && (
                <LabelList
                  dataKey={barConfig.dataKey}
                  position={barConfig.labelPosition || 'top'}
                  formatter={barConfig.labelFormatter}
                  style={{ fontSize: 11, fill: theme.palette.text.primary }}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default BarChartComponent;