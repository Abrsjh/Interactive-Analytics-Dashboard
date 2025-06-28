import React, { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Paper, Box, Typography, useTheme, Button, ButtonGroup } from '@mui/material';
import ChartWrapper from './ChartWrapper';
import { DataPoint } from './LineChartComponent';

// US geoJSON source
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Types
export interface MapConfig {
  valueKey: string;
  nameKey?: string;
  idKey?: string;
  labelKey?: string;
  projectionConfig?: {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  };
  colorScale?: string[];
  domain?: [number, number];
}

export interface MarkerData {
  id: string | number;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  value: number;
  label?: string;
  color?: string;
}

export interface MapProps {
  data: DataPoint[];
  markers?: MarkerData[];
  annotations?: {
    coordinates: [number, number];
    dx?: number;
    dy?: number;
    label: string;
  }[];
  config: MapConfig;
  title: string;
  subtitle?: string;
  height?: number;
  isLoading?: boolean;
  error?: string | null;
  showTooltip?: boolean;
  showLegend?: boolean;
  allowZoom?: boolean;
  onRegionClick?: (geo: any, data: any) => void;
  onMarkerClick?: (marker: MarkerData) => void;
  tooltipFormatter?: (value: any, name: string) => string;
  onRefresh?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A reusable map component built on react-simple-maps with consistent styling and extended functionality
 */
const MapComponent: React.FC<MapProps> = ({
  data,
  markers = [],
  annotations = [],
  config,
  title,
  subtitle,
  height = 400,
  isLoading = false,
  error = null,
  showTooltip = true,
  showLegend = true,
  allowZoom = true,
  onRegionClick,
  onMarkerClick,
  tooltipFormatter,
  onRefresh,
  className,
  style,
}) => {
  const theme = useTheme();
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [-95, 36],
    zoom: 1
  });
  const [tooltip, setTooltip] = useState<{ show: boolean; content: string; position: { x: number; y: number } }>({
    show: false,
    content: '',
    position: { x: 0, y: 0 }
  });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Create a value-to-color mapping scale
  const getColorScale = () => {
    const defaultColors = [
      theme.palette.primary.light,
      theme.palette.primary.main,
      theme.palette.primary.dark,
    ];

    const colors = config.colorScale || defaultColors;
    const domain = config.domain || [0, 100];

    return scaleQuantize<string>()
      .domain(domain)
      .range(colors);
  };

  // Map data by geo ID or name for quick lookup
  const getDataMap = () => {
    const idKey = config.idKey || 'id';
    const nameKey = config.nameKey || 'name';
    const valueKey = config.valueKey;
    
    const dataMap = new Map();
    
    data.forEach(item => {
      // Try to match by ID first, then by name
      const key = item[idKey] || item[nameKey];
      if (key) {
        dataMap.set(key.toString(), {
          ...item,
          value: item[valueKey] || 0
        });
      }
    });
    
    return dataMap;
  };

  // Handle map zoom
  const handleZoom = (newPosition: { coordinates: [number, number]; zoom: number }) => {
    setPosition(newPosition);
  };

  // Handle map reset
  const handleReset = () => {
    setPosition({
      coordinates: [-95, 36],
      zoom: 1
    });
    setSelectedRegion(null);
  };

  // Handle geography click
  const handleGeographyClick = (geo: any, evt: React.MouseEvent) => {
    if (onRegionClick) {
      const dataMap = getDataMap();
      const geoId = geo.id || geo.properties.name;
      const regionData = dataMap.get(geoId) || null;
      
      onRegionClick(geo, regionData);
    }
    
    setSelectedRegion(geo.id || geo.properties.name);
  };

  // Handle geography mouse enter
  const handleGeographyMouseEnter = (geo: any, evt: React.MouseEvent) => {
    if (!showTooltip) return;
    
    const dataMap = getDataMap();
    const geoId = geo.id || geo.properties.name;
    const regionData = dataMap.get(geoId);
    
    if (regionData) {
      const valueKey = config.valueKey;
      const nameKey = config.nameKey || 'name';
      const name = regionData[nameKey] || geo.properties.name;
      const value = regionData[valueKey] || 0;
      
      let content = `${name}: ${value}`;
      if (tooltipFormatter) {
        content = tooltipFormatter(value, name);
      }
      
      setTooltip({
        show: true,
        content,
        position: { x: evt.clientX, y: evt.clientY }
      });
    }
  };

  // Handle geography mouse leave
  const handleGeographyMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  // Handle marker click
  const handleMarkerClick = (marker: MarkerData) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  // Handle marker mouse enter
  const handleMarkerMouseEnter = (marker: MarkerData, evt: React.MouseEvent) => {
    if (!showTooltip) return;
    
    let content = `${marker.name}: ${marker.value}`;
    if (tooltipFormatter) {
      content = tooltipFormatter(marker.value, marker.name);
    }
    
    setTooltip({
      show: true,
      content,
      position: { x: evt.clientX, y: evt.clientY }
    });
  };

  // Handle marker mouse leave
  const handleMarkerMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  // Export data to CSV
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const valueKey = config.valueKey;
    const nameKey = config.nameKey || 'name';
    const idKey = config.idKey || 'id';

    // Create CSV content
    let csvContent = `${idKey},${nameKey},${valueKey}\n`;
    data.forEach((row) => {
      const id = row[idKey] || '';
      const name = row[nameKey] || '';
      const value = row[valueKey] || 0;
      
      // Handle values that might contain commas
      const formattedName = typeof name === 'string' && name.includes(',') ? `"${name}"` : name;
      
      csvContent += `${id},${formattedName},${value}\n`;
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_map_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colorScale = getColorScale();
  const dataMap = getDataMap();

  // Custom map controls
  const MapControls = () => (
    <Box sx={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1 }}>
      <ButtonGroup size="small" variant="outlined">
        <Button onClick={() => setPosition(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 8) }))}>
          +
        </Button>
        <Button onClick={() => setPosition(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 1) }))}>
          -
        </Button>
        <Button onClick={handleReset}>
          Reset
        </Button>
      </ButtonGroup>
    </Box>
  );

  // Legend component
  const Legend = () => {
    const colorDomain = colorScale.domain();
    const steps = colorScale.range().length;
    const step = (colorDomain[1] - colorDomain[0]) / steps;
    
    return (
      <Box sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1, bgcolor: 'rgba(255, 255, 255, 0.8)', p: 1, borderRadius: 1 }}>
        <Typography variant="caption" fontWeight="bold">Legend</Typography>
        {colorScale.range().map((color, i) => {
          const min = Math.round(colorDomain[0] + step * i);
          const max = Math.round(colorDomain[0] + step * (i + 1));
          
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: color, mr: 1 }} />
              <Typography variant="caption">
                {min} - {max}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Tooltip component
  const Tooltip = memo(() => {
    if (!tooltip.show) return null;
    
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'fixed',
          left: tooltip.position.x + 10,
          top: tooltip.position.y + 10,
          p: 1,
          zIndex: 1500,
          pointerEvents: 'none',
          maxWidth: 200,
        }}
      >
        <Typography variant="caption">{tooltip.content}</Typography>
      </Paper>
    );
  });

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
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={config.projectionConfig || {}}
          className={className}
          style={{ width: '100%', height: '100%', ...style }}
        >
          {allowZoom ? (
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleZoom}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const geoId = geo.id || geo.properties.name;
                    const regionData = dataMap.get(geoId);
                    const isSelected = selectedRegion === geoId;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={regionData ? colorScale(regionData.value) : theme.palette.grey[300]}
                        stroke={theme.palette.background.paper}
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: 'none',
                          },
                          hover: {
                            outline: 'none',
                            stroke: theme.palette.primary.main,
                            strokeWidth: 1,
                            cursor: 'pointer',
                          },
                          pressed: {
                            outline: 'none',
                          }
                        }}
                        onClick={(evt) => handleGeographyClick(geo, evt)}
                        onMouseEnter={(evt) => handleGeographyMouseEnter(geo, evt)}
                        onMouseLeave={handleGeographyMouseLeave}
                      />
                    );
                  })
                }
              </Geographies>
              
              {/* Markers */}
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinates={marker.coordinates}
                  onClick={() => handleMarkerClick(marker)}
                  onMouseEnter={(evt) => handleMarkerMouseEnter(marker, evt as any)}
                  onMouseLeave={handleMarkerMouseLeave}
                >
                  <circle
                    r={6}
                    fill={marker.color || theme.palette.secondary.main}
                    stroke={theme.palette.background.paper}
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                  />
                  {marker.label && (
                    <text
                      textAnchor="middle"
                      y={-10}
                      style={{
                        fontSize: 10,
                        fill: theme.palette.text.primary,
                        pointerEvents: 'none',
                      }}
                    >
                      {marker.label}
                    </text>
                  )}
                </Marker>
              ))}
              
              {/* Annotations */}
              {annotations.map((annotation, i) => (
                <Annotation
                  key={`annotation-${i}`}
                  subject={annotation.coordinates}
                  dx={annotation.dx || 0}
                  dy={annotation.dy || 0}
                >
                  <text
                    x={4}
                    fontSize={10}
                    alignmentBaseline="middle"
                    fill={theme.palette.text.primary}
                  >
                    {annotation.label}
                  </text>
                </Annotation>
              ))}
            </ZoomableGroup>
          ) : (
            <>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const geoId = geo.id || geo.properties.name;
                    const regionData = dataMap.get(geoId);
                    const isSelected = selectedRegion === geoId;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={regionData ? colorScale(regionData.value) : theme.palette.grey[300]}
                        stroke={theme.palette.background.paper}
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: 'none',
                          },
                          hover: {
                            outline: 'none',
                            stroke: theme.palette.primary.main,
                            strokeWidth: 1,
                            cursor: 'pointer',
                          },
                          pressed: {
                            outline: 'none',
                          }
                        }}
                        onClick={(evt) => handleGeographyClick(geo, evt)}
                        onMouseEnter={(evt) => handleGeographyMouseEnter(geo, evt)}
                        onMouseLeave={handleGeographyMouseLeave}
                      />
                    );
                  })
                }
              </Geographies>
            </>
          )}
        </ComposableMap>
        
        {/* Controls */}
        {allowZoom && <MapControls />}
        
        {/* Legend */}
        {showLegend && <Legend />}
        
        {/* Tooltip */}
        {showTooltip && <Tooltip />}
      </Box>
    </ChartWrapper>
  );
};

export default MapComponent;