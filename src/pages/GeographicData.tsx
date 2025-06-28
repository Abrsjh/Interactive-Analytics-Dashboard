import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/system';
import {
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Info as InfoIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGlobalState } from '../context/GlobalStateContext';

// Types
interface RegionData {
  id: string;
  name: string;
  value: number;
  marketShare: number;
  growth: number;
  country: string;
  position: [number, number]; // [longitude, latitude]
}

interface CountryData {
  country: string;
  sales: number;
  marketShare: number;
  growth: number;
  regions: RegionData[];
}

// Mock data
const geoData: CountryData[] = [
  {
    country: 'United States',
    sales: 4250000,
    marketShare: 42.5,
    growth: 12.3,
    regions: [
      { id: 'us-ny', name: 'New York', value: 850000, marketShare: 20, growth: 8.5, country: 'United States', position: [-74.0059, 40.7128] },
      { id: 'us-ca', name: 'California', value: 1250000, marketShare: 29.4, growth: 15.2, country: 'United States', position: [-119.4179, 36.7783] },
      { id: 'us-tx', name: 'Texas', value: 780000, marketShare: 18.4, growth: 14.7, country: 'United States', position: [-99.9018, 31.9686] },
      { id: 'us-fl', name: 'Florida', value: 620000, marketShare: 14.6, growth: 11.8, country: 'United States', position: [-81.5158, 27.6648] },
      { id: 'us-il', name: 'Illinois', value: 450000, marketShare: 10.6, growth: 7.2, country: 'United States', position: [-89.3985, 40.6331] },
      { id: 'us-other', name: 'Other States', value: 300000, marketShare: 7.0, growth: 9.5, country: 'United States', position: [-95.7129, 37.0902] },
    ]
  },
  {
    country: 'Canada',
    sales: 1250000,
    marketShare: 12.5,
    growth: 8.7,
    regions: [
      { id: 'ca-on', name: 'Ontario', value: 550000, marketShare: 44, growth: 7.5, country: 'Canada', position: [-79.3832, 43.6532] },
      { id: 'ca-qc', name: 'Quebec', value: 350000, marketShare: 28, growth: 6.2, country: 'Canada', position: [-71.2075, 46.8123] },
      { id: 'ca-bc', name: 'British Columbia', value: 250000, marketShare: 20, growth: 12.8, country: 'Canada', position: [-123.1207, 49.2827] },
      { id: 'ca-other', name: 'Other Provinces', value: 100000, marketShare: 8, growth: 5.4, country: 'Canada', position: [-106.3468, 56.1304] },
    ]
  },
  {
    country: 'United Kingdom',
    sales: 950000,
    marketShare: 9.5,
    growth: 6.2,
    regions: [
      { id: 'uk-lon', name: 'London', value: 450000, marketShare: 47.4, growth: 8.1, country: 'United Kingdom', position: [-0.1278, 51.5074] },
      { id: 'uk-man', name: 'Manchester', value: 180000, marketShare: 18.9, growth: 5.7, country: 'United Kingdom', position: [-2.2426, 53.4808] },
      { id: 'uk-bir', name: 'Birmingham', value: 140000, marketShare: 14.7, growth: 4.2, country: 'United Kingdom', position: [-1.8904, 52.4862] },
      { id: 'uk-other', name: 'Other Cities', value: 180000, marketShare: 19.0, growth: 4.5, country: 'United Kingdom', position: [-3.4360, 55.3781] },
    ]
  },
  {
    country: 'Germany',
    sales: 850000,
    marketShare: 8.5,
    growth: 5.8,
    regions: [
      { id: 'de-ber', name: 'Berlin', value: 250000, marketShare: 29.4, growth: 7.5, country: 'Germany', position: [13.4050, 52.5200] },
      { id: 'de-muc', name: 'Munich', value: 180000, marketShare: 21.2, growth: 6.8, country: 'Germany', position: [11.5820, 48.1351] },
      { id: 'de-fra', name: 'Frankfurt', value: 150000, marketShare: 17.6, growth: 4.2, country: 'Germany', position: [8.6821, 50.1109] },
      { id: 'de-other', name: 'Other Cities', value: 270000, marketShare: 31.8, growth: 4.8, country: 'Germany', position: [10.4515, 51.1657] },
    ]
  },
  {
    country: 'Japan',
    sales: 780000,
    marketShare: 7.8,
    growth: 4.5,
    regions: [
      { id: 'jp-tok', name: 'Tokyo', value: 350000, marketShare: 44.9, growth: 5.2, country: 'Japan', position: [139.6917, 35.6895] },
      { id: 'jp-osa', name: 'Osaka', value: 180000, marketShare: 23.1, growth: 3.8, country: 'Japan', position: [135.5023, 34.6937] },
      { id: 'jp-other', name: 'Other Cities', value: 250000, marketShare: 32.0, growth: 4.1, country: 'Japan', position: [138.2529, 36.2048] },
    ]
  },
  {
    country: 'Australia',
    sales: 520000,
    marketShare: 5.2,
    growth: 9.8,
    regions: [
      { id: 'au-syd', name: 'Sydney', value: 220000, marketShare: 42.3, growth: 10.5, country: 'Australia', position: [151.2093, -33.8688] },
      { id: 'au-mel', name: 'Melbourne', value: 180000, marketShare: 34.6, growth: 9.2, country: 'Australia', position: [144.9631, -37.8136] },
      { id: 'au-other', name: 'Other Cities', value: 120000, marketShare: 23.1, growth: 8.7, country: 'Australia', position: [133.7751, -25.2744] },
    ]
  },
  {
    country: 'Other Countries',
    sales: 1400000,
    marketShare: 14.0,
    growth: 18.5,
    regions: [
      { id: 'oc-ch', name: 'China', value: 450000, marketShare: 32.1, growth: 22.5, country: 'Other Countries', position: [104.1954, 35.8617] },
      { id: 'oc-in', name: 'India', value: 350000, marketShare: 25.0, growth: 28.7, country: 'Other Countries', position: [78.9629, 20.5937] },
      { id: 'oc-br', name: 'Brazil', value: 280000, marketShare: 20.0, growth: 15.2, country: 'Other Countries', position: [-51.9253, -14.2350] },
      { id: 'oc-za', name: 'South Africa', value: 120000, marketShare: 8.6, growth: 12.8, country: 'Other Countries', position: [22.9375, -30.5595] },
      { id: 'oc-other', name: 'Rest of World', value: 200000, marketShare: 14.3, growth: 10.5, country: 'Other Countries', position: [0, 0] },
    ]
  },
];

// Get all regions for flat viewing
const allRegions: RegionData[] = geoData.reduce((acc, country) => [...acc, ...country.regions], [] as RegionData[]);

// Create a flat structure for map data
const mapData = allRegions.filter(region => region.id !== 'oc-other');

// Component
const GeographicData: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("sales");
  const [highlightedRegion, setHighlightedRegion] = useState<RegionData | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Update last updated timestamp
        dispatch({ type: 'UPDATE_LAST_UPDATED' });
      } catch (error) {
        console.error('Error loading geographic data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load geographic data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Filter data based on selected country
  const filteredData = useMemo(() => {
    if (selectedCountry === "all") {
      return geoData;
    }
    return geoData.filter(country => country.country === selectedCountry);
  }, [selectedCountry]);

  // Get filtered regions for map display
  const filteredRegions = useMemo(() => {
    if (selectedCountry === "all") {
      return mapData;
    }
    return mapData.filter(region => region.country === selectedCountry);
  }, [selectedCountry]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData.map(country => ({
      name: country.country,
      sales: country.sales,
      marketShare: country.marketShare,
      growth: country.growth,
    }));
  }, [filteredData]);

  // Color scale for map
  const getRegionColor = (region: RegionData) => {
    const metric = selectedMetric === 'sales' ? 'value' : 
                  selectedMetric === 'marketShare' ? 'marketShare' : 'growth';
    
    const value = region[metric as keyof RegionData] as number;
    const maxValue = Math.max(...filteredRegions.map(r => r[metric as keyof RegionData] as number));
    
    // Simple gradient scale based on percentage of max value
    const intensity = Math.min(Math.max(value / maxValue, 0.1), 1);
    
    return alpha(theme.palette.primary.main, intensity);
  };

  // Handle country change
  const handleCountryChange = (event: SelectChangeEvent) => {
    setSelectedCountry(event.target.value);
    setHighlightedRegion(null);
  };

  // Handle metric change
  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value);
  };

  // Handle region click
  const handleRegionClick = (region: RegionData) => {
    setHighlightedRegion(region);
  };

  // Format currency value
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  // Get map height based on selected country
  const getMapHeight = () => {
    if (selectedCountry === 'United States' || selectedCountry === 'Canada') {
      return 400;
    }
    if (selectedCountry === 'all') {
      return 500;
    }
    return 350;
  };

  // Convert geo coordinates to x/y positions for the simple map
  const geoToPosition = (long: number, lat: number) => {
    // Convert longitude (-180 to 180) to percentage (0 to 100)
    const x = ((long + 180) / 360) * 100;
    
    // Convert latitude (-90 to 90) to percentage (100 to 0)
    // Reverse Y because geographic coordinates have north as positive,
    // but screen coordinates have y increasing downward
    const y = (1 - ((lat + 90) / 180)) * 100;
    
    return { x, y };
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Geographic Sales Analysis
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="country-label">Region</InputLabel>
            <Select
              labelId="country-label"
              value={selectedCountry}
              label="Region"
              onChange={handleCountryChange}
            >
              <MenuItem value="all">Global</MenuItem>
              {geoData.map(country => (
                <MenuItem key={country.country} value={country.country}>
                  {country.country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="metric-label">Metric</InputLabel>
            <Select
              labelId="metric-label"
              value={selectedMetric}
              label="Metric"
              onChange={handleMetricChange}
            >
              <MenuItem value="sales">Sales Revenue</MenuItem>
              <MenuItem value="marketShare">Market Share</MenuItem>
              <MenuItem value="growth">YoY Growth</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
          
          <Tooltip title="Export Data">
            <IconButton size="small" color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Map View */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={1} sx={{ height: '100%' }}>
            <CardHeader 
              title={selectedCountry === 'all' ? 'Global Sales Distribution' : `${selectedCountry} Sales Distribution`}
              action={
                <Tooltip title="Click on a region to see detailed information">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={getMapHeight()} />
              ) : (
                <Box sx={{ 
                  height: getMapHeight(), 
                  width: '100%', 
                  position: 'relative',
                  bgcolor: theme.palette.grey[100],
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Simple Map Background */}
                  <Box sx={{ 
                    width: '90%', 
                    height: '80%', 
                    position: 'relative',
                    background: `linear-gradient(${theme.palette.grey[200]}, ${theme.palette.background.paper})`,
                    borderRadius: 2,
                    boxShadow: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    {/* Map Legend */}
                    <Box sx={{ 
                      position: 'absolute', 
                      right: 16, 
                      top: 16, 
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      fontSize: '0.75rem'
                    }}>
                      <Typography variant="caption" display="block" fontWeight="bold" mb={0.5}>
                        {selectedMetric === 'sales' ? 'Sales Revenue' : 
                         selectedMetric === 'marketShare' ? 'Market Share' : 'YoY Growth'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.3) }}></Box>
                        <Typography variant="caption">Low</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.6) }}></Box>
                        <Typography variant="caption">Medium</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.9) }}></Box>
                        <Typography variant="caption">High</Typography>
                      </Box>
                    </Box>
                    
                    {/* Country outlines - simple lines */}
                    {selectedCountry === 'all' && (
                      <>
                        {/* North America */}
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '15%', 
                          top: '35%', 
                          width: '25%', 
                          height: '20%', 
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 1
                        }}></Box>
                        
                        {/* Europe */}
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '45%', 
                          top: '30%', 
                          width: '10%', 
                          height: '15%', 
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 1
                        }}></Box>
                        
                        {/* Asia */}
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '60%', 
                          top: '35%', 
                          width: '20%', 
                          height: '25%', 
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 1
                        }}></Box>
                        
                        {/* Australia */}
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '70%', 
                          top: '65%', 
                          width: '12%', 
                          height: '15%', 
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 1
                        }}></Box>
                      </>
                    )}
                    
                    {/* Region dots */}
                    {filteredRegions.map((region) => {
                      const { x, y } = geoToPosition(region.position[0], region.position[1]);
                      const size = Math.sqrt(region.value) * 0.00002 + 0.5;
                      const isHighlighted = region === highlightedRegion;
                      
                      return (
                        <Box
                          key={region.id}
                          onClick={() => handleRegionClick(region)}
                          sx={{
                            position: 'absolute',
                            left: `${x}%`,
                            top: `${y}%`,
                            width: isHighlighted ? '16px' : '12px',
                            height: isHighlighted ? '16px' : '12px',
                            bgcolor: getRegionColor(region),
                            border: isHighlighted ? `2px solid ${theme.palette.common.white}` : 'none',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isHighlighted ? 2 : 0,
                            zIndex: isHighlighted ? 10 : 1,
                            opacity: highlightedRegion && !isHighlighted ? 0.6 : 1,
                            '&:hover': {
                              boxShadow: 2,
                              transform: 'translate(-50%, -50%) scale(1.2)',
                            }
                          }}
                        />
                      );
                    })}
                    
                    {/* Highlighted region label */}
                    {highlightedRegion && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${geoToPosition(highlightedRegion.position[0], highlightedRegion.position[1]).x}%`,
                          top: `${geoToPosition(highlightedRegion.position[0], highlightedRegion.position[1]).y - 8}%`,
                          bgcolor: alpha(theme.palette.background.paper, 0.8),
                          color: theme.palette.text.primary,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          transform: 'translate(-50%, -100%)',
                          whiteSpace: 'nowrap',
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: 1,
                          zIndex: 20
                        }}
                      >
                        {highlightedRegion.name}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card elevation={1}>
            <CardHeader 
              title={
                highlightedRegion 
                  ? `${highlightedRegion.name} Details` 
                  : `${selectedCountry === 'all' ? 'Global' : selectedCountry} Metrics`
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : highlightedRegion ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {highlightedRegion.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary">
                          Sales Revenue
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 1 }}>
                          {formatCurrency(highlightedRegion.value)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary">
                          Market Share
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 1 }}>
                          {highlightedRegion.marketShare.toFixed(1)}%
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary">
                          YoY Growth
                        </Typography>
                        <Typography 
                          variant="h5" 
                          sx={{ mt: 1 }} 
                          color={highlightedRegion.growth > 0 ? 'success.main' : 'error.main'}
                        >
                          {highlightedRegion.growth > 0 ? '+' : ''}{highlightedRegion.growth.toFixed(1)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setHighlightedRegion(null)}
                    >
                      Back to Overview
                    </Button>
                  </Box>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Region</TableCell>
                        <TableCell align="right">
                          {selectedMetric === 'sales' ? 'Sales Revenue' : 
                          selectedMetric === 'marketShare' ? 'Market Share' : 'YoY Growth'}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.map((country) => (
                        <TableRow key={country.country}>
                          <TableCell>{country.country}</TableCell>
                          <TableCell align="right">
                            {selectedMetric === 'sales' ? formatCurrency(country.sales) : 
                            selectedMetric === 'marketShare' ? `${country.marketShare}%` : 
                            `${country.growth > 0 ? '+' : ''}${country.growth}%`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Chart */}
          <Card elevation={1} sx={{ mt: 3 }}>
            <CardHeader title="Comparison Chart" />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => 
                          selectedMetric === 'sales' 
                            ? `$${value / 1000}k` 
                            : `${value}%`
                        }
                        stroke={theme.palette.text.secondary}
                      />
                      <RechartsTooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'Sales Revenue') {
                            return [formatCurrency(value), name];
                          }
                          return [`${value}%`, name];
                        }}
                      />
                      <Legend />
                      {selectedMetric === 'sales' && (
                        <Bar 
                          yAxisId="left"
                          dataKey="sales"
                          name="Sales Revenue"
                          fill={theme.palette.primary.main}
                        />
                      )}
                      {selectedMetric === 'marketShare' && (
                        <Bar 
                          yAxisId="left"
                          dataKey="marketShare"
                          name="Market Share"
                          fill={theme.palette.primary.main}
                        />
                      )}
                      {selectedMetric === 'growth' && (
                        <Line 
                          yAxisId="left"
                          type="monotone"
                          dataKey="growth"
                          name="YoY Growth"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Regions Table */}
      <Card elevation={1} sx={{ mt: 3 }}>
        <CardHeader 
          title="Detailed Region Data" 
          subheader={`Showing all regions${selectedCountry !== 'all' ? ` in ${selectedCountry}` : ''}`}
        />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Region</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Sales Revenue</TableCell>
                    <TableCell align="right">Market Share</TableCell>
                    <TableCell align="right">YoY Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(selectedCountry === 'all' 
                    ? allRegions 
                    : allRegions.filter(r => r.country === selectedCountry))
                    .map((region) => (
                      <TableRow 
                        key={region.id}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: highlightedRegion?.id === region.id 
                            ? `${theme.palette.primary.main}20` 
                            : 'inherit',
                          '&:hover': {
                            bgcolor: `${theme.palette.primary.main}10`,
                          }
                        }}
                        onClick={() => handleRegionClick(region)}
                      >
                        <TableCell>{region.name}</TableCell>
                        <TableCell>{region.country}</TableCell>
                        <TableCell align="right">{formatCurrency(region.value)}</TableCell>
                        <TableCell align="right">{region.marketShare.toFixed(1)}%</TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: region.growth > 0 
                              ? theme.palette.success.main 
                              : theme.palette.error.main 
                          }}
                        >
                          {region.growth > 0 ? '+' : ''}{region.growth.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GeographicData;