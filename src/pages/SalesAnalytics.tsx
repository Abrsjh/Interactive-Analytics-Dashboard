import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Button,
  IconButton,
  Chip,
  Stack,
  Tabs,
  Tab,
  Paper,
  Skeleton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Brush,
  ReferenceArea,
  ReferenceLabel,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useGlobalState } from '../context/GlobalStateContext';
import { format, subDays, subMonths, isAfter, isBefore } from 'date-fns';

// Types
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SalesData {
  date: string;
  revenue: number;
  transactions: number;
  customers: number;
  averageOrderValue: number;
  previousYearRevenue?: number;
  forecastRevenue?: number;
}

interface ProductCategoryData {
  category: string;
  revenue: number;
  transactions: number;
  growth: number;
  subcategories?: {
    name: string;
    revenue: number;
    transactions: number;
    growth: number;
  }[];
}

interface SalesChannelData {
  channel: string;
  revenue: number;
  percentage: number;
}

interface RegionData {
  region: string;
  revenue: number;
  transactions: number;
  customers: number;
}

// Mock data
const generateSalesData = (): SalesData[] => {
  const data: SalesData[] = [];
  const today = new Date();
  
  // Generate data for the last 90 days
  for (let i = 90; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    
    // Base values
    let revenue = 10000 + Math.random() * 5000;
    let transactions = 150 + Math.random() * 100;
    
    // Weekend boost
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      revenue *= 1.4;
      transactions *= 1.3;
    }
    
    // Monthly trend (increasing)
    revenue *= (1 + (90 - i) * 0.003);
    transactions *= (1 + (90 - i) * 0.002);
    
    // Previous year (slightly lower)
    const previousYearRevenue = revenue * 0.85;
    
    // Forecast (slightly higher)
    const forecastRevenue = i < 15 ? revenue * 1.1 : undefined;
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      revenue: Math.round(revenue),
      transactions: Math.round(transactions),
      customers: Math.round(transactions * 0.9),
      averageOrderValue: Math.round(revenue / transactions),
      previousYearRevenue: Math.round(previousYearRevenue),
      forecastRevenue,
    });
  }
  
  return data;
};

const productCategories: ProductCategoryData[] = [
  {
    category: 'Electronics',
    revenue: 450000,
    transactions: 7500,
    growth: 15.3,
    subcategories: [
      { name: 'Smartphones', revenue: 180000, transactions: 3000, growth: 18.5 },
      { name: 'Laptops', revenue: 150000, transactions: 2500, growth: 12.2 },
      { name: 'Accessories', revenue: 70000, transactions: 1500, growth: 8.7 },
      { name: 'Audio', revenue: 50000, transactions: 500, growth: 25.4 },
    ],
  },
  {
    category: 'Clothing',
    revenue: 320000,
    transactions: 10000,
    growth: 8.7,
    subcategories: [
      { name: 'Men\'s', revenue: 120000, transactions: 3500, growth: 5.3 },
      { name: 'Women\'s', revenue: 150000, transactions: 5000, growth: 12.1 },
      { name: 'Children\'s', revenue: 50000, transactions: 1500, growth: 7.2 },
    ],
  },
  {
    category: 'Home & Kitchen',
    revenue: 220000,
    transactions: 6000,
    growth: 12.5,
    subcategories: [
      { name: 'Appliances', revenue: 100000, transactions: 2000, growth: 15.3 },
      { name: 'Furniture', revenue: 80000, transactions: 1000, growth: 9.8 },
      { name: 'Decor', revenue: 40000, transactions: 3000, growth: 10.2 },
    ],
  },
  {
    category: 'Books',
    revenue: 120000,
    transactions: 8000,
    growth: 3.2,
    subcategories: [
      { name: 'Fiction', revenue: 50000, transactions: 4000, growth: 2.1 },
      { name: 'Non-Fiction', revenue: 40000, transactions: 3000, growth: 5.7 },
      { name: 'Educational', revenue: 30000, transactions: 1000, growth: 1.5 },
    ],
  },
  {
    category: 'Beauty & Personal Care',
    revenue: 180000,
    transactions: 5500,
    growth: 18.4,
    subcategories: [
      { name: 'Skincare', revenue: 80000, transactions: 2500, growth: 22.5 },
      { name: 'Makeup', revenue: 60000, transactions: 2000, growth: 15.7 },
      { name: 'Haircare', revenue: 40000, transactions: 1000, growth: 12.3 },
    ],
  },
];

const salesChannels: SalesChannelData[] = [
  { channel: 'Online Store', revenue: 580000, percentage: 45 },
  { channel: 'Mobile App', revenue: 320000, percentage: 25 },
  { channel: 'Marketplace', revenue: 240000, percentage: 18 },
  { channel: 'Physical Stores', revenue: 120000, percentage: 9 },
  { channel: 'Other', revenue: 40000, percentage: 3 },
];

const regions: RegionData[] = [
  { region: 'North America', revenue: 650000, transactions: 12000, customers: 10000 },
  { region: 'Europe', revenue: 480000, transactions: 9000, customers: 8000 },
  { region: 'Asia', revenue: 380000, transactions: 7500, customers: 6500 },
  { region: 'Australia', revenue: 120000, transactions: 2500, customers: 2000 },
  { region: 'South America', revenue: 90000, transactions: 1800, customers: 1500 },
  { region: 'Africa', revenue: 50000, transactions: 1000, customers: 800 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

// TabPanel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main Component
const SalesAnalytics: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useGlobalState();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeframe, setTimeframe] = useState('90days');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{ x1: number; x2: number; y1: number; y2: number } | null>(null);
  const [zoomStartIndex, setZoomStartIndex] = useState<number | null>(null);

  // Fetch data on component mount and when timeframe changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Generate mock data based on selected timeframe
        const data = generateSalesData();
        setSalesData(data);
        
        // Update last updated timestamp
        dispatch({ type: 'UPDATE_LAST_UPDATED' });
      } catch (error) {
        console.error('Error loading sales analytics data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load sales data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeframe, dispatch]);

  // Filter data based on selected date range
  const filteredSalesData = salesData.filter(item => {
    const itemDate = new Date(item.date);
    return (!startDate || isAfter(itemDate, startDate)) && 
           (!endDate || isBefore(itemDate, endDate));
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle timeframe change
  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
    
    // Update date range based on timeframe
    const now = new Date();
    switch (event.target.value) {
      case '30days':
        setStartDate(subDays(now, 30));
        break;
      case '90days':
        setStartDate(subDays(now, 90));
        break;
      case '6months':
        setStartDate(subMonths(now, 6));
        break;
      case '1year':
        setStartDate(subMonths(now, 12));
        break;
      default:
        setStartDate(null);
    }
    setEndDate(now);
  };

  // Handle category selection
  const handleCategoryChange = (event: SelectChangeEvent<typeof selectedCategories>) => {
    const {
      target: { value },
    } = event;
    setSelectedCategories(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle channel selection
  const handleChannelChange = (event: SelectChangeEvent<typeof selectedChannels>) => {
    const {
      target: { value },
    } = event;
    setSelectedChannels(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle category drilldown
  const handleCategoryClick = (category: string) => {
    setDrilldownCategory(category);
  };

  // Handle returning from drilldown
  const handleReturnFromDrilldown = () => {
    setDrilldownCategory(null);
  };

  // Handle zoom in charts
  const handleZoom = useCallback((startIndex: number | null) => {
    if (startIndex === null) {
      setZoomStartIndex(null);
      setZoomDomain(null);
      return;
    }
    
    if (zoomStartIndex === null) {
      setZoomStartIndex(startIndex);
    } else {
      const endIndex = startIndex;
      const x1 = Math.min(zoomStartIndex, endIndex);
      const x2 = Math.max(zoomStartIndex, endIndex);
      
      const dataSlice = filteredSalesData.slice(x1, x2 + 1);
      if (dataSlice.length > 0) {
        const minRevenue = Math.min(...dataSlice.map(d => d.revenue));
        const maxRevenue = Math.max(...dataSlice.map(d => d.revenue));
        
        setZoomDomain({
          x1,
          x2,
          y1: minRevenue * 0.9,
          y2: maxRevenue * 1.1,
        });
      }
      
      setZoomStartIndex(null);
    }
  }, [zoomStartIndex, filteredSalesData]);

  // Handle reset zoom
  const handleResetZoom = () => {
    setZoomDomain(null);
    setZoomStartIndex(null);
  };

  // Filter categories based on selection
  const filteredCategories = selectedCategories.length === 0
    ? productCategories
    : productCategories.filter(cat => selectedCategories.includes(cat.category));

  // Filter channels based on selection
  const filteredChannels = selectedChannels.length === 0
    ? salesChannels
    : salesChannels.filter(channel => selectedChannels.includes(channel.channel));
  
  // Get subcategories for drilldown view
  const drilldownData = drilldownCategory 
    ? productCategories.find(cat => cat.category === drilldownCategory)?.subcategories || []
    : [];

  // Custom tooltip formatter for charts
  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString()}`;
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
          Sales Analytics
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="timeframe-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-label"
              value={timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          
          {timeframe === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Stack>
            </LocalizationProvider>
          )}
          
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
      
      {/* Filters */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 2
        }}
        elevation={1}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Filters</Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="categories-label">Product Categories</InputLabel>
            <Select
              labelId="categories-label"
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Product Categories"
            >
              {productCategories.map((category) => (
                <MenuItem key={category.category} value={category.category}>
                  {category.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="channels-label">Sales Channels</InputLabel>
            <Select
              labelId="channels-label"
              multiple
              value={selectedChannels}
              onChange={handleChannelChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Sales Channels"
            >
              {salesChannels.map((channel) => (
                <MenuItem key={channel.channel} value={channel.channel}>
                  {channel.channel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            label="Search Products"
            variant="outlined"
          />
        </Box>
      </Paper>
      
      {/* KPI Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading ? (
          Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${(filteredSalesData.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    +12.5% vs previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h4" component="div">
                    {filteredSalesData.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    +8.3% vs previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Average Order Value
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${Math.round(filteredSalesData.reduce((sum, item) => sum + item.revenue, 0) / 
                      filteredSalesData.reduce((sum, item) => sum + item.transactions, 0))}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    +3.7% vs previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    3.8%
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    -0.5% vs previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Main Content Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sales analytics tabs">
            <Tab label="Revenue Trends" />
            <Tab label="Product Categories" />
            <Tab label="Sales Channels" />
            <Tab label="Geographic Distribution" />
          </Tabs>
        </Box>
        
        {/* Revenue Trends Tab */}
        <TabPanel value={tabValue} index={0}>
          <Card elevation={1}>
            <CardHeader 
              title="Revenue Trends" 
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Zoom In">
                    <IconButton size="small" onClick={() => setZoomStartIndex(0)}>
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Zoom">
                    <IconButton size="small" onClick={handleResetZoom}>
                      <ResetIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={400} />
              ) : (
                <Box sx={{ height: 400, width: '100%' }}>
                  <ResponsiveContainer>
                    <ComposedChart
                      data={filteredSalesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      onClick={(data) => data && data.activeTooltipIndex !== undefined && handleZoom(data.activeTooltipIndex)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        stroke={theme.palette.text.secondary}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `$${value / 1000}k`}
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => `${value}`}
                        domain={['auto', 'auto']}
                      />
                      <RechartsTooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'Revenue' || name === 'Previous Year' || name === 'Forecast') {
                            return [`$${value.toLocaleString()}`, name];
                          }
                          return [value.toLocaleString(), name];
                        }}
                        labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke={theme.palette.primary.main}
                        dot={false}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="previousYearRevenue"
                        name="Previous Year"
                        stroke={theme.palette.grey[500]}
                        dot={false}
                        strokeDasharray="5 5"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="forecastRevenue"
                        name="Forecast"
                        stroke={theme.palette.secondary.main}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="transactions"
                        name="Transactions"
                        fill={theme.palette.info.light}
                        fillOpacity={0.6}
                        barSize={5}
                      />
                      <Brush 
                        dataKey="date"
                        height={30}
                        stroke={theme.palette.primary.main}
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        startIndex={Math.max(0, filteredSalesData.length - 30)}
                      />
                      {zoomDomain && (
                        <ReferenceArea
                          yAxisId="left"
                          x1={zoomDomain.x1}
                          x2={zoomDomain.x2}
                          y1={zoomDomain.y1}
                          y2={zoomDomain.y2}
                          stroke="red"
                          strokeOpacity={0.3}
                          fillOpacity={0.1}
                        />
                      )}
                      {zoomStartIndex !== null && (
                        <ReferenceArea
                          yAxisId="left"
                          x1={zoomStartIndex}
                          x2={zoomStartIndex}
                          y1={0}
                          y2={Math.max(...filteredSalesData.map(d => d.revenue)) * 1.1}
                          stroke="blue"
                          strokeOpacity={0.5}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader title="Daily Sales Trends" />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={filteredSalesData.slice(-30)}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => format(new Date(value), 'dd')}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value / 1000}k`}
                            stroke={theme.palette.text.secondary}
                          />
                          <RechartsTooltip 
                            formatter={formatTooltipValue}
                            labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke={theme.palette.primary.main}
                            fill={theme.palette.primary.main}
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader title="Average Order Value Trend" />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart
                          data={filteredSalesData.slice(-30)}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => format(new Date(value), 'dd')}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value}`}
                            stroke={theme.palette.text.secondary}
                          />
                          <RechartsTooltip 
                            formatter={(value: number) => [`$${value}`, 'AOV']}
                            labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                          />
                          <Line
                            type="monotone"
                            dataKey="averageOrderValue"
                            name="AOV"
                            stroke={theme.palette.secondary.main}
                            strokeWidth={2}
                            dot={{ fill: theme.palette.secondary.main, r: 1 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Product Categories Tab */}
        <TabPanel value={tabValue} index={1}>
          {drilldownCategory ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleReturnFromDrilldown}
                  sx={{ mr: 2 }}
                >
                  Back to Categories
                </Button>
                <Typography variant="h6">{drilldownCategory} Subcategories</Typography>
              </Box>
              
              <Card elevation={1}>
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                  ) : (
                    <Box sx={{ height: 400, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={drilldownData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            yAxisId="left"
                            tickFormatter={(value) => `$${value / 1000}k`}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            stroke={theme.palette.text.secondary}
                            tickFormatter={(value) => `${value}%`}
                            domain={[-30, 30]}
                          />
                          <RechartsTooltip 
                            formatter={(value: number, name: string) => {
                              if (name === 'Revenue') {
                                return [`$${value.toLocaleString()}`, name];
                              }
                              if (name === 'Growth') {
                                return [`${value}%`, name];
                              }
                              return [value.toLocaleString(), name];
                            }}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="revenue"
                            name="Revenue"
                            fill={theme.palette.primary.main}
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="transactions"
                            name="Transactions"
                            fill={theme.palette.info.main}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="growth"
                            name="Growth"
                            stroke={theme.palette.success.main}
                            strokeWidth={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card elevation={1}>
              <CardContent>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={400} />
                ) : (
                  <Box sx={{ height: 400, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={filteredCategories}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        onClick={(data) => {
                          if (data && data.activePayload && data.activePayload[0]) {
                            const category = data.activePayload[0].payload.category;
                            handleCategoryClick(category);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="category" 
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          stroke={theme.palette.text.secondary}
                        />
                        <YAxis 
                          yAxisId="left"
                          tickFormatter={(value) => `$${value / 1000}k`}
                          stroke={theme.palette.text.secondary}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke={theme.palette.text.secondary}
                          tickFormatter={(value) => `${value}%`}
                          domain={[-30, 30]}
                        />
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === 'Revenue') {
                              return [`$${value.toLocaleString()}`, name];
                            }
                            if (name === 'Growth') {
                              return [`${value}%`, name];
                            }
                            return [value.toLocaleString(), name];
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <Paper
                                  elevation={3}
                                  sx={{ 
                                    p: 2, 
                                    backgroundColor: 'background.paper',
                                    border: `1px solid ${theme.palette.divider}`
                                  }}
                                >
                                  <Typography variant="subtitle2" gutterBottom>
                                    {payload[0].payload.category}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Revenue: ${payload[0].value?.toLocaleString()}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Transactions: {payload[1].value?.toLocaleString()}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color={Number(payload[2].value) > 0 ? 'success.main' : 'error.main'}
                                  >
                                    Growth: {payload[2].value}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Click to see subcategories
                                  </Typography>
                                </Paper>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="revenue"
                          name="Revenue"
                          fill={theme.palette.primary.main}
                          cursor="pointer"
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="transactions"
                          name="Transactions"
                          fill={theme.palette.info.main}
                          cursor="pointer"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="growth"
                          name="Growth"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </TabPanel>
        
        {/* Sales Channels Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader title="Sales Channel Distribution" />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="circular" width="100%" height={300} />
                  ) : (
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={filteredChannels}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="percentage"
                            nameKey="channel"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {filteredChannels.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string, props: any) => {
                              const revenue = props.payload.revenue;
                              return [`$${revenue.toLocaleString()} (${value}%)`, name];
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader title="Channel Revenue Comparison" />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={filteredChannels}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            type="number"
                            tickFormatter={(value) => `$${value / 1000}k`}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            type="category"
                            dataKey="channel"
                            stroke={theme.palette.text.secondary}
                          />
                          <RechartsTooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Bar 
                            dataKey="revenue" 
                            name="Revenue" 
                            fill={theme.palette.primary.main}
                            label={{ 
                              position: 'right', 
                              formatter: (value: number) => `$${value / 1000}k`,
                              fill: theme.palette.text.secondary,
                            }}
                          >
                            {filteredChannels.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Geographic Distribution Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card elevation={1}>
            <CardHeader 
              title="Regional Sales Distribution" 
              action={
                <Tooltip title="This visualization shows the sales distribution across different regions. Click on a region to see more details.">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={400} />
              ) : (
                <Box sx={{ height: 400, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={regions}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="region"
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value / 1000}k`}
                        stroke={theme.palette.text.secondary}
                      />
                      <RechartsTooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'Revenue') {
                            return [`$${value.toLocaleString()}`, name];
                          }
                          return [value.toLocaleString(), name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill={theme.palette.primary.main}>
                        {regions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
            Regional Performance Metrics
          </Typography>
          
          <Grid container spacing={2}>
            {isLoading ? (
              Array.from(new Array(6)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={120} />
                </Grid>
              ))
            ) : (
              regions.map((region) => (
                <Grid item xs={12} sm={6} md={4} key={region.region}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {region.region}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Revenue
                          </Typography>
                          <Typography variant="body1">
                            ${(region.revenue / 1000).toFixed(0)}k
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Orders
                          </Typography>
                          <Typography variant="body1">
                            {region.transactions.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Customers
                          </Typography>
                          <Typography variant="body1">
                            {region.customers.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SalesAnalytics;