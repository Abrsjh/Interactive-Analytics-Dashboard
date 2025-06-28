import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Sector,
  TooltipProps,
} from 'recharts';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import ChartWrapper from './ChartWrapper';
import { DataPoint } from './LineChartComponent';

// Types
export interface PieConfig {
  dataKey: string;
  nameKey: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  minAngle?: number;
  isAnimationActive?: boolean;
  animationDuration?: number;
  label?: boolean | Function;
}

export interface PieChartProps {
  data: DataPoint[];
  pie: PieConfig;
  title: string;
  subtitle?: string;
  height?: number;
  isLoading?: boolean;
  error?: string | null;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  colorScale?: string[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number | undefined) => void;
  onPieClick?: (data: any, index: number) => void;
  onRefresh?: () => void;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tooltipLabelFormatter?: (label: any) => string;
  tooltipContent?: React.ReactElement | ((props: TooltipProps<any, any>) => React.ReactElement);
  donut?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A reusable pie chart component built on Recharts with consistent styling and extended functionality
 */
const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  pie,
  title,
  subtitle,
  height = 300,
  isLoading = false,
  error = null,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  colorScale,
  activeIndex: externalActiveIndex,
  onActiveIndexChange,
  onPieClick,
  onRefresh,
  tooltipFormatter,
  tooltipLabelFormatter,
  tooltipContent,
  donut = false,
  className,
  style,
}) => {
  const theme = useTheme();
  const [localActiveIndex, setLocalActiveIndex] = useState<number | undefined>(undefined);
  
  // Use external or local active index
  const activeIndex = externalActiveIndex !== undefined ? externalActiveIndex : localActiveIndex;

  // Colors for pie segments
  const getColors = () => {
    if (colorScale && colorScale.length > 0) return colorScale;

    return [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.primary.light,
      theme.palette.secondary.light,
      theme.palette.success.light,
      theme.palette.error.light,
      theme.palette.warning.light,
      theme.palette.info.light,
      theme.palette.primary.dark,
      theme.palette.secondary.dark,
      theme.palette.success.dark,
      theme.palette.error.dark,
      theme.palette.warning.dark,
      theme.palette.info.dark,
    ];
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const { name, value } = payload[0];

    return (
      <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" gutterBottom>
          {tooltipLabelFormatter ? tooltipLabelFormatter(name) : name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 12,
              height: 12,
              mr: 1,
              bgcolor: payload[0].color,
              borderRadius: '50%',
            }}
          />
          <Typography variant="body2" component="span" sx={{ mr: 0.5 }}>
            Value:
          </Typography>
          <Typography variant="body2" component="span" fontWeight="bold">
            {tooltipFormatter
              ? tooltipFormatter(value, name, payload[0])[0]
              : value}
          </Typography>
        </Box>
      </Paper>
    );
  };

  // Custom active shape for hover effect
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    
    const nameKey = pie.nameKey || 'name';
    const sin = Math.sin(-Math.PI / 2);
    const cos = Math.cos(-Math.PI / 2);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={theme.palette.background.paper}
          strokeWidth={2}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={theme.palette.text.primary} fontSize={12}>
          {payload[nameKey]}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill={theme.palette.text.secondary} fontSize={12}>
          {`${value} (${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  // Export data to CSV
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const nameKey = pie.nameKey || 'name';
    const valueKey = pie.dataKey;

    // Create CSV content
    let csvContent = `${nameKey},${valueKey}\n`;
    data.forEach((row) => {
      const name = row[nameKey];
      const value = row[valueKey];
      
      // Handle values that might contain commas
      const formattedName = typeof name === 'string' && name.includes(',') ? `"${name}"` : name;
      
      csvContent += `${formattedName},${value}\n`;
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

  // Handle mouse enter on pie segment
  const handleMouseEnter = (_: any, index: number) => {
    setLocalActiveIndex(index);
    if (onActiveIndexChange) onActiveIndexChange(index);
  };

  // Handle mouse leave from pie segment
  const handleMouseLeave = () => {
    setLocalActiveIndex(undefined);
    if (onActiveIndexChange) onActiveIndexChange(undefined);
  };

  // Handle click on pie segment
  const handleClick = (data: any, index: number) => {
    if (onPieClick) onPieClick(data, index);
  };

  // Calculate default inner radius if donut mode is enabled
  const getInnerRadius = () => {
    if (pie.innerRadius !== undefined) return pie.innerRadius;
    return donut ? '60%' : 0;
  };

  // Calculate default outer radius
  const getOuterRadius = () => {
    if (pie.outerRadius !== undefined) return pie.outerRadius;
    return '80%';
  };

  const colors = getColors();

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
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={300} aspect={4/3}>
        <PieChart className={className} style={style}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={showLabels ? true : false}
            innerRadius={getInnerRadius()}
            outerRadius={getOuterRadius()}
            paddingAngle={pie.paddingAngle || 0}
            cornerRadius={pie.cornerRadius || 0}
            startAngle={pie.startAngle || 0}
            endAngle={pie.endAngle || 360}
            minAngle={pie.minAngle || 0}
            dataKey={pie.dataKey}
            nameKey={pie.nameKey || 'name'}
            isAnimationActive={pie.isAnimationActive !== undefined ? pie.isAnimationActive : true}
            animationDuration={pie.animationDuration || 400}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
                stroke={theme.palette.background.paper}
                strokeWidth={1}
              />
            ))}
          </Pie>
          
          {showTooltip && (
            tooltipContent ? (
              <Tooltip content={tooltipContent} />
            ) : (
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
                content={<CustomTooltip />}
              />
            )
          )}
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              layout="horizontal"
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default PieChartComponent;