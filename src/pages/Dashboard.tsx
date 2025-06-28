import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Paper, 
  Box,
  Button,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Skeleton,
  useTheme
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useGlobalState } from '../context/GlobalStateContext';
import { format } from 'date-fns';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 4000, target: 4500, lastYear: 3800 },
  { month: 'Feb', revenue: 5100, target: 4800, lastYear: 4300 },
  { month: 'Mar', revenue: 6200, target: 5200, lastYear: 5100 },
  { month: 'Apr', revenue: 5900, target: 5700, lastYear: 4800 },
  { month: 'May', revenue: 7000, target: 6100, lastYear: 6000 },
  { month: 'Jun', revenue: 7500, target: 6500, lastYear: 6200 },
  { month: 'Jul', revenue: 8200, target: 7000, lastYear: 6800 },
  { month: 'Aug', revenue: 7800, target: 7300, lastYear: 6600 },
  { month: 'Sep', revenue: 8500, target: 7800, lastYear: 7200 },
  { month: 'Oct', revenue: 9200, target: 8500, lastYear: 8000 },
  { month: 'Nov', revenue: 8800, target: 9000, lastYear: 8500 },
  { month: 'Dec', revenue: 10500, target: 9500, lastYear: 9200 },
];

const salesByCategory = [
  { name: 'Electronics', value: 35 },
  { name: 'Clothing', value: 25 },
  { name: 'Home & Kitchen', value: 15 },
  { name: 'Books', value: 10 },
  { name: 'Others', value: 15 },
];

const salesByRegion = [
  { region: 'North America', sales: 45000 },
  { region: 'Europe', sales: 35000 },
  { region: 'Asia', sales: 30000 },
  { region: 'Australia', sales: 15000 },
  { region: 'South America', sales: 12000 },
  { region: 'Africa', sales: 8000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useGlobalState();
  const [timeRange, setTimeRange] = useState('year');
  const [isLoading, setIsLoading] = useState(false);
  const [kpis, setKpis] = useState({
    revenue: { value: 1250000, change: 15.3 },
    orders: { value: 12450, change: 8.7 },
    customers: { value: 8320, change: 12.2 },
    aov: { value: 105.42, change: -2.1 }
  });

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update last updated timestamp
        dispatch({ type: 'UPDATE_LAST_UPDATED' });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, timeRange]);

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleRefresh = () => {
    dispatch({ type: 'UPDATE_LAST_UPDATED' });
    // Reload data
  };

  const filteredRevenueData = timeRange === 'quarter' 
    ? revenueData.slice(0, 3) 
    : timeRange === 'half' 
      ? revenueData.slice(0, 6) 
      : revenueData;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="quarter">Quarter</MenuItem>
              <MenuItem value="half">Half Year</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardHeader 
              title="Revenue" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              action={<IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="text" height={60} />
              ) : (
                <>
                  <Typography variant="h4" component="div">
                    ${(kpis.revenue.value / 1000).toFixed(0)}k
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {kpis.revenue.change > 0 ? (
                      <ArrowUpwardIcon fontSize="small" color="success" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" color="error" />
                    )}
                    <Typography 
                      variant="body2" 
                      color={kpis.revenue.change > 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {Math.abs(kpis.revenue.change)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      vs last period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardHeader 
              title="Orders" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              action={<IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="text" height={60} />
              ) : (
                <>
                  <Typography variant="h4" component="div">
                    {kpis.orders.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {kpis.orders.change > 0 ? (
                      <ArrowUpwardIcon fontSize="small" color="success" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" color="error" />
                    )}
                    <Typography 
                      variant="body2" 
                      color={kpis.orders.change > 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {Math.abs(kpis.orders.change)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      vs last period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardHeader 
              title="Customers" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              action={<IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="text" height={60} />
              ) : (
                <>
                  <Typography variant="h4" component="div">
                    {kpis.customers.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {kpis.customers.change > 0 ? (
                      <ArrowUpwardIcon fontSize="small" color="success" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" color="error" />
                    )}
                    <Typography 
                      variant="body2" 
                      color={kpis.customers.change > 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {Math.abs(kpis.customers.change)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      vs last period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardHeader 
              title="Avg. Order Value" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              action={<IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="text" height={60} />
              ) : (
                <>
                  <Typography variant="h4" component="div">
                    ${kpis.aov.value.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {kpis.aov.change > 0 ? (
                      <ArrowUpwardIcon fontSize="small" color="success" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" color="error" />
                    )}
                    <Typography 
                      variant="body2" 
                      color={kpis.aov.change > 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {Math.abs(kpis.aov.change)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      vs last period
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardHeader 
              title="Revenue Trend" 
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={filteredRevenueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke={theme.palette.primary.main}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        name="Target"
                        stroke={theme.palette.secondary.main}
                        strokeDasharray="5 5"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="lastYear"
                        name="Last Year"
                        stroke={theme.palette.grey[500]}
                        strokeWidth={1.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Category */}
        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardHeader 
              title="Sales by Category" 
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
              ) : (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Sales']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Region */}
        <Grid item xs={12} md={6} lg={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Sales by Region" 
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={salesByRegion}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="region" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" name="Sales" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6} lg={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Recent Activity" 
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              }
            />
            <CardContent>
              {isLoading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', py: 1.5 }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <TrendingUpIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        Sales increased by 24% in North America
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'success.main', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <TrendingUpIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        New product launched: Smart Home Hub
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(new Date().setDate(new Date().getDate() - 1)), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'warning.main', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <TrendingDownIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        Inventory alert: Running low on Electronics
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(new Date().setDate(new Date().getDate() - 2)), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'info.main', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <TrendingUpIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        Customer satisfaction rating improved to 4.8/5
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(new Date().setDate(new Date().getDate() - 3)), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;