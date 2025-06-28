import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TextField,
  Button,
  IconButton,
  Slider,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
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
  Scatter,
  ScatterChart,
  ZAxis,
  ReferenceArea,
  ReferenceLine,
  ComposedChart,
  Cell,
} from 'recharts';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import { useGlobalState } from '../context/GlobalStateContext';

// Types
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SalesData {
  date: string;
  formattedDate: string; // For display
  revenue: number;
  transactions: number;
  actual: boolean; // Flag for actual vs predicted data
}

interface ForecastData extends SalesData {
  lower95: number; // Lower bound of 95% confidence interval
  upper95: number; // Upper bound of 95% confidence interval
  model: string; // Model identifier
}

interface ModelParam {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
}

interface PredictionModel {
  id: string;
  name: string;
  description: string;
  params: ModelParam[];
  accuracy: number;
}

// TabPanel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prediction-tabpanel-${index}`}
      aria-labelledby={`prediction-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Linear regression function (simplified for demo)
function linearRegression(data: SalesData[]): { slope: number; intercept: number } {
  // Check if data array is empty
  if (!data || data.length === 0) {
    return { slope: 0, intercept: 0 };
  }

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  // Convert dates to numeric x values (days since start)
  // No need to access data[0].date since we already checked if data exists and has length
  
  data.forEach((point, index) => {
    const x = index; // use index as x for simplicity
    const y = point.revenue;
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  // Prevent division by zero
  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = n !== 0 ? (sumY - slope * sumX) / n : 0;
  
  return { slope, intercept };
}

// Generate mock historical sales data
const generateHistoricalData = (): SalesData[] => {
  const data: SalesData[] = [];
  const today = new Date();
  
  // Generate 24 months of historical data
  for (let i = 24; i >= 1; i--) {
    const date = subMonths(today, i);
    
    // Create some seasonality and trend
    const monthIndex = date.getMonth();
    const yearOffset = date.getFullYear() - today.getFullYear() + 2; // +2 to make it positive
    
    // Base revenue with yearly growth
    let revenue = 200000 + yearOffset * 40000;
    
    // Seasonal variation (Q4 higher, Q1 lower)
    if (monthIndex >= 9) { // Q4: Oct, Nov, Dec
      revenue *= 1.3;
    } else if (monthIndex <= 2) { // Q1: Jan, Feb, Mar
      revenue *= 0.85;
    } else if (monthIndex >= 6 && monthIndex <= 8) { // Q3: Jul, Aug, Sep
      revenue *= 1.1;
    }
    
    // Add some randomness (±7%)
    revenue *= (0.93 + Math.random() * 0.14);
    
    // Calculate transactions based on average order value
    const transactions = Math.round(revenue / 120); // Assuming $120 average order
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      formattedDate: format(date, 'MMM yyyy'),
      revenue: Math.round(revenue),
      transactions,
      actual: true
    });
  }
  
  return data;
};

// Different prediction models
const predictionModels: PredictionModel[] = [
  {
    id: 'linear',
    name: 'Linear Trend',
    description: 'Simple linear regression model that projects future values based on historical trend',
    params: [
      {
        id: 'seasonality',
        name: 'Seasonality Factor',
        value: 1.0,
        min: 0.5,
        max: 1.5,
        step: 0.1,
        description: 'Adjusts the seasonal variations in the forecast'
      },
      {
        id: 'growth',
        name: 'Growth Factor',
        value: 1.0,
        min: 0.8,
        max: 1.2,
        step: 0.05,
        description: 'Adjusts the overall growth rate'
      }
    ],
    accuracy: 0.85
  },
  {
    id: 'exponential',
    name: 'Exponential Growth',
    description: 'Assumes exponential growth pattern, useful for rapidly growing markets',
    params: [
      {
        id: 'growthRate',
        name: 'Growth Rate',
        value: 0.05,
        min: 0.01,
        max: 0.2,
        step: 0.01,
        description: 'Monthly growth rate percentage'
      },
      {
        id: 'saturation',
        name: 'Saturation Level',
        value: 0.8,
        min: 0.5,
        max: 1.0,
        step: 0.05,
        description: 'Market saturation factor'
      }
    ],
    accuracy: 0.78
  },
  {
    id: 'seasonal',
    name: 'Seasonal Adjusted',
    description: 'Incorporates recurring seasonal patterns for more accurate quarterly projections',
    params: [
      {
        id: 'q1Factor',
        name: 'Q1 Adjustment',
        value: 0.85,
        min: 0.7,
        max: 1.0,
        step: 0.05,
        description: 'Q1 seasonal adjustment factor'
      },
      {
        id: 'q4Factor',
        name: 'Q4 Adjustment',
        value: 1.3,
        min: 1.0,
        max: 1.5,
        step: 0.05,
        description: 'Q4 seasonal adjustment factor'
      }
    ],
    accuracy: 0.91
  }
];

// Generate forecast data based on historical data and model
const generateForecast = (
  historicalData: SalesData[],
  modelId: string,
  months: number,
  params: { [key: string]: number }
): ForecastData[] => {
  const forecast: ForecastData[] = [];
  
  if (historicalData.length === 0) {
    return [];
  }
  
  // Get last date from historical data
  const lastDate = parseISO(historicalData[historicalData.length - 1].date);
  
  // Perform linear regression on historical data
  const { slope, intercept } = linearRegression(historicalData);
  
  // Generate forecasts
  for (let i = 1; i <= months; i++) {
    const forecastDate = addMonths(lastDate, i);
    const monthIndex = forecastDate.getMonth();
    const x = historicalData.length - 1 + i; // continue from last historical point
    
    // Base prediction from linear regression
    let predictedRevenue = intercept + slope * x;
    
    // Apply model-specific adjustments
    switch(modelId) {
      case 'linear':
        // Apply seasonality factor
        if (monthIndex >= 9) { // Q4
          predictedRevenue *= params.seasonality * 1.3;
        } else if (monthIndex <= 2) { // Q1
          predictedRevenue *= params.seasonality * 0.85;
        } else if (monthIndex >= 6 && monthIndex <= 8) { // Q3
          predictedRevenue *= params.seasonality * 1.1;
        }
        
        // Apply growth factor
        predictedRevenue *= params.growth;
        break;
        
      case 'exponential':
        // Apply exponential growth
        predictedRevenue *= Math.pow(1 + params.growthRate, i);
        
        // Apply saturation dampening
        const saturationEffect = 1 - Math.pow(i / (months * 2), 2) * (1 - params.saturation);
        predictedRevenue *= saturationEffect;
        break;
        
      case 'seasonal':
        // Apply quarterly factors
        if (monthIndex >= 0 && monthIndex <= 2) { // Q1
          predictedRevenue *= params.q1Factor;
        } else if (monthIndex >= 9) { // Q4
          predictedRevenue *= params.q4Factor;
        }
        break;
    }
    
    // Add some variability to the confidence intervals
    const variability = predictedRevenue * (0.05 + (i * 0.01)); // Uncertainty increases with time
    
    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      formattedDate: format(forecastDate, 'MMM yyyy'),
      revenue: Math.round(predictedRevenue),
      transactions: Math.round(predictedRevenue / 120), // Assuming $120 average order
      lower95: Math.round(predictedRevenue - variability),
      upper95: Math.round(predictedRevenue + variability),
      actual: false,
      model: modelId
    });
  }
  
  return forecast;
};

// Main component
const Predictions: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [historicalData, setHistoricalData] = useState<SalesData[]>([]);
  const [forecastMonths, setForecastMonths] = useState<number>(12);
  const [selectedModelId, setSelectedModelId] = useState<string>('linear');
  const [modelParams, setModelParams] = useState<{ [key: string]: { [key: string]: number } }>({
    linear: {
      seasonality: 1.0,
      growth: 1.0
    },
    exponential: {
      growthRate: 0.05,
      saturation: 0.8
    },
    seasonal: {
      q1Factor: 0.85,
      q4Factor: 1.3
    }
  });
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true);
  const [compareModels, setCompareModels] = useState<boolean>(false);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Generate mock data
        const mockData = generateHistoricalData();
        setHistoricalData(mockData);
        
        // Update last updated timestamp
        dispatch({ type: 'UPDATE_LAST_UPDATED' });
      } catch (error) {
        console.error('Error loading prediction data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load prediction data' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // Generate forecast based on current model and parameters
  const forecast = useMemo(() => {
    if (historicalData.length === 0) {
      return [];
    }
    
    return generateForecast(
      historicalData, 
      selectedModelId, 
      forecastMonths,
      modelParams[selectedModelId]
    );
  }, [historicalData, selectedModelId, forecastMonths, modelParams]);
  
  // Generate comparative forecasts for all models
  const comparativeForecasts = useMemo(() => {
    if (historicalData.length === 0) {
      return {};
    }
    
    const forecasts: { [key: string]: ForecastData[] } = {};
    
    predictionModels.forEach(model => {
      forecasts[model.id] = generateForecast(
        historicalData, 
        model.id, 
        forecastMonths,
        modelParams[model.id]
      );
    });
    
    return forecasts;
  }, [historicalData, forecastMonths, modelParams]);
  
  // Combine historical and forecast data for charts
  const combinedData = useMemo(() => {
    return [...historicalData, ...forecast];
  }, [historicalData, forecast]);
  
  // Get currently selected model
  const selectedModel = useMemo(() => {
    return predictionModels.find(model => model.id === selectedModelId) || predictionModels[0];
  }, [selectedModelId]);
  
  // Calculate summary metrics
  const metrics = useMemo(() => {
    if (forecast.length === 0) {
      return {
        totalRevenue: 0,
        averageMonthlyRevenue: 0,
        growthRate: 0,
        confidenceLevel: 0
      };
    }
    
    const totalRevenue = forecast.reduce((sum, item) => sum + item.revenue, 0);
    const averageMonthlyRevenue = totalRevenue / forecast.length;
    
    const firstHistorical = historicalData[0];
    const lastHistorical = historicalData[historicalData.length - 1];
    const lastForecast = forecast[forecast.length - 1];
    
    const monthsBetweenFirstAndLast = historicalData.length;
    const historicalMonthlyGrowth = Math.pow(lastHistorical.revenue / firstHistorical.revenue, 1 / monthsBetweenFirstAndLast) - 1;
    
    const monthsBetweenLastHistoricalAndLastForecast = forecast.length;
    const forecastMonthlyGrowth = Math.pow(lastForecast.revenue / lastHistorical.revenue, 1 / monthsBetweenLastHistoricalAndLastForecast) - 1;
    
    // Display annual growth rate
    const growthRate = forecastMonthlyGrowth * 12 * 100;
    
    // Confidence level based on model accuracy and forecast length
    const confidenceLevel = selectedModel.accuracy * (1 - (forecast.length / 36)); // Confidence decreases as forecast extends
    
    return {
      totalRevenue,
      averageMonthlyRevenue,
      growthRate,
      confidenceLevel: confidenceLevel * 100
    };
  }, [historicalData, forecast, selectedModel]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle model change
  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModelId(event.target.value);
  };
  
  // Handle forecast months change
  const handleMonthsChange = (event: Event, newValue: number | number[]) => {
    setForecastMonths(newValue as number);
  };
  
  // Handle parameter change
  const handleParamChange = (modelId: string, paramId: string, value: number) => {
    setModelParams(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [paramId]: value
      }
    }));
  };
  
  // Toggle confidence interval display
  const handleToggleConfidenceInterval = () => {
    setShowConfidenceInterval(prev => !prev);
  };
  
  // Toggle model comparison
  const handleToggleCompareModels = () => {
    setCompareModels(prev => !prev);
    if (!compareModels) {
      setTabValue(0); // Switch to forecast tab when enabling comparison
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2">{data.formattedDate}</Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue: {formatCurrency(data.revenue)}
          </Typography>
          {payload.some((p: any) => p.dataKey === 'lower95') && (
            <>
              <Typography variant="body2" color="text.secondary">
                95% Confidence Interval:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(data.lower95)} - {formatCurrency(data.upper95)}
              </Typography>
            </>
          )}
          {data.model && (
            <Typography variant="body2" color="primary">
              Model: {predictionModels.find(m => m.id === data.model)?.name || data.model}
            </Typography>
          )}
          <Chip 
            label={data.actual ? "Actual" : "Forecast"} 
            color={data.actual ? "success" : "primary"}
            size="small"
            sx={{ mt: 1 }}
          />
        </Paper>
      );
    }
    
    return null;
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
          Predictive Analytics
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
            size="small"
          >
            Refresh Data
          </Button>
          
          <Button 
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export Forecast
          </Button>
        </Box>
      </Box>
      
      {/* Model Controls */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="model-label">Forecasting Model</InputLabel>
              <Select
                labelId="model-label"
                value={selectedModelId}
                label="Forecasting Model"
                onChange={handleModelChange}
              >
                {predictionModels.map(model => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name} ({(model.accuracy * 100).toFixed(0)}% accuracy)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {selectedModel.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography id="forecast-months-slider" gutterBottom>
              Forecast Period: {forecastMonths} months
            </Typography>
            <Slider
              size="small"
              value={forecastMonths}
              onChange={handleMonthsChange}
              aria-labelledby="forecast-months-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={3}
              max={24}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={showConfidenceInterval ? "contained" : "outlined"}
                onClick={handleToggleConfidenceInterval}
                color="primary"
              >
                {showConfidenceInterval ? "Hide Confidence Interval" : "Show Confidence Interval"}
              </Button>
              
              <Button
                size="small"
                variant={compareModels ? "contained" : "outlined"}
                onClick={handleToggleCompareModels}
                color="secondary"
              >
                {compareModels ? "Hide Comparison" : "Compare Models"}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Alert severity="info" sx={{ py: 0 }}>
              Model confidence: {metrics.confidenceLevel.toFixed(0)}%
            </Alert>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Model Parameters */}
      {!compareModels && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Model Parameters</Typography>
            <Tooltip title="Adjust these parameters to fine-tune the forecast">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Grid container spacing={3}>
            {selectedModel.params.map(param => (
              <Grid item xs={12} sm={6} md={4} key={param.id}>
                <Typography id={`param-${param.id}-slider`} gutterBottom>
                  {param.name}: {modelParams[selectedModelId][param.id]}
                </Typography>
                <Slider
                  size="small"
                  value={modelParams[selectedModelId][param.id]}
                  onChange={(_event, newValue) => 
                    handleParamChange(selectedModelId, param.id, newValue as number)
                  }
                  aria-labelledby={`param-${param.id}-slider`}
                  valueLabelDisplay="auto"
                  step={param.step}
                  min={param.min}
                  max={param.max}
                />
                <Typography variant="caption" color="text.secondary">
                  {param.description}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Forecast Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading ? (
          Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={1}>
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
                    Forecasted Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(metrics.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next {forecastMonths} months
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Avg. Monthly Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(metrics.averageMonthlyRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projected monthly average
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Annual Growth Rate
                  </Typography>
                  <Typography variant="h4" color={metrics.growthRate > 0 ? "success.main" : "error.main"}>
                    {metrics.growthRate > 0 ? "+" : ""}{metrics.growthRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annualized projection
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Forecast End Date
                  </Typography>
                  <Typography variant="h4">
                    {forecast && forecast.length > 0 ? forecast[forecast.length - 1]?.formattedDate : "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {forecastMonths} months from now
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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="prediction tabs">
            <Tab label="Revenue Forecast" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Regression Analysis" icon={<TimelineIcon />} iconPosition="start" />
            <Tab label="Scenario Comparison" icon={<TimelineIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* Revenue Forecast Tab */}
        <TabPanel value={tabValue} index={0}>
          <Card elevation={1}>
            <CardHeader 
              title="Revenue Forecast" 
              subheader={`Using ${selectedModel.name} model with ${forecastMonths} month projection`}
              action={
                <Tooltip title="This chart shows historical data and forecast with confidence intervals">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={500} />
              ) : (
                <Box sx={{ height: 500, width: '100%' }}>
                  <ResponsiveContainer>
                    {compareModels ? (
                      <ComposedChart
                        data={[
                          ...historicalData,
                          ...Object.values(comparativeForecasts).flat()
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="formattedDate" 
                          scale="band"
                          stroke={theme.palette.text.secondary}
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value/1000}k`}
                          stroke={theme.palette.text.secondary}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {/* Historical data */}
                        <Bar
                          dataKey="revenue"
                          name="Historical Revenue"
                          fill={theme.palette.grey[400]}
                          barSize={20}
                          isAnimationActive={false}
                        >
                          {historicalData.map((_entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={theme.palette.grey[400]}
                              opacity={0.7}
                            />
                          ))}
                        </Bar>
                        
                        {/* Model forecasts */}
                        {predictionModels.map((model, index) => (
                          <Line
                            key={model.id}
                            dataKey="revenue"
                            name={`${model.name} Forecast`}
                            stroke={
                              model.id === 'linear' ? theme.palette.primary.main :
                              model.id === 'exponential' ? theme.palette.secondary.main :
                              theme.palette.success.main
                            }
                            strokeWidth={2}
                            dot={false}
                            connectNulls={true}
                            isAnimationActive={false}
                            data={[
                              ...Array(historicalData.length).fill(null),
                              ...comparativeForecasts[model.id]
                            ]}
                          />
                        ))}
                        
                        {/* Reference line for last actual data point */}
                        <ReferenceLine
                          x={historicalData[historicalData.length - 1]?.formattedDate}
                          stroke={theme.palette.divider}
                          strokeWidth={2}
                          label={{
                            value: "Forecast Start",
                            position: "insideTopRight",
                            fill: theme.palette.text.secondary,
                          }}
                        />
                      </ComposedChart>
                    ) : (
                      <ComposedChart
                        data={combinedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="formattedDate" 
                          scale="band"
                          stroke={theme.palette.text.secondary}
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value/1000}k`}
                          stroke={theme.palette.text.secondary}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {/* Confidence interval */}
                        {showConfidenceInterval && (
                          <Area
                            type="monotone"
                            dataKey="upper95"
                            stroke="transparent"
                            fill={theme.palette.primary.main}
                            fillOpacity={0.1}
                            isAnimationActive={false}
                          />
                        )}
                        
                        {showConfidenceInterval && (
                          <Area
                            type="monotone"
                            dataKey="lower95"
                            stroke="transparent"
                            fill={theme.palette.primary.main}
                            fillOpacity={0.0}
                            isAnimationActive={false}
                          />
                        )}
                        
                        {/* Historical data */}
                        <Bar
                          dataKey="revenue"
                          name="Historical Revenue"
                          fill={theme.palette.grey[400]}
                          barSize={20}
                          isAnimationActive={false}
                        >
                          {combinedData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.actual ? theme.palette.grey[400] : "transparent"}
                              opacity={0.7}
                            />
                          ))}
                        </Bar>
                        
                        {/* Forecast line */}
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Forecast"
                          stroke={theme.palette.primary.main}
                          strokeWidth={3}
                          dot={{ r: 1 }}
                          isAnimationActive={false}
                          activeDot={{ r: 8 }}
                        >
                          {combinedData.map((entry, index) => (
                            <Cell 
                              key={`point-${index}`}
                              stroke={entry.actual ? "transparent" : theme.palette.primary.main}
                            />
                          ))}
                        </Line>
                        
                        {/* Reference line for last actual data point */}
                        <ReferenceLine
                          x={historicalData[historicalData.length - 1]?.formattedDate}
                          stroke={theme.palette.divider}
                          strokeWidth={2}
                          label={{
                            value: "Forecast Start",
                            position: "insideTopRight",
                            fill: theme.palette.text.secondary,
                          }}
                        />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader 
                  title="Monthly Forecast" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={forecast}
                          margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="formattedDate" 
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value/1000}k`}
                            stroke={theme.palette.text.secondary}
                          />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar 
                            dataKey="revenue" 
                            name="Forecasted Revenue" 
                            fill={theme.palette.primary.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader 
                  title="Revenue vs Transactions" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer>
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            type="number" 
                            dataKey="transactions" 
                            name="Transactions" 
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="revenue" 
                            name="Revenue" 
                            tickFormatter={(value) => `$${value/1000}k`}
                            stroke={theme.palette.text.secondary}
                          />
                          <ZAxis 
                            type="category"
                            dataKey="formattedDate"
                            range={[60, 60]}
                            name="Month"
                          />
                          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                          <Legend />
                          <Scatter 
                            name="Historical" 
                            data={historicalData} 
                            fill={theme.palette.grey[600]}
                          />
                          <Scatter 
                            name="Forecast" 
                            data={forecast} 
                            fill={theme.palette.primary.main}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Regression Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card elevation={1}>
            <CardHeader 
              title="Linear Regression Analysis" 
              subheader="Trend line fitted to historical data"
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={400} />
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer>
                    <ScatterChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="index" 
                        type="number" 
                        name="Month Index"
                        stroke={theme.palette.text.secondary}
                        domain={[0, 'auto']}
                        tick={false}
                        label={{ 
                          value: 'Time (months)', 
                          position: 'insideBottom', 
                          offset: -10,
                          fill: theme.palette.text.secondary 
                        }}
                      />
                      <YAxis 
                        dataKey="revenue" 
                        name="Revenue"
                        tickFormatter={(value) => `$${value/1000}k`}
                        stroke={theme.palette.text.secondary}
                        label={{ 
                          value: 'Revenue', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: theme.palette.text.secondary
                        }}
                      />
                      <RechartsTooltip
                        formatter={(value: any, name: string) => {
                          if (name === 'Revenue') {
                            return [formatCurrency(value), name];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(value) => `Month ${value}`}
                      />
                      <Legend />
                      
                      <Scatter 
                        name="Historical Data Points" 
                        data={historicalData.map((item, index) => ({ ...item, index }))} 
                        fill={theme.palette.info.main}
                        shape="circle"
                      />
                      
                      {/* Regression Line */}
                      {(() => {
                        const { slope, intercept } = linearRegression(historicalData);
                        const lineStart = intercept;
                        const lineEnd = intercept + slope * (historicalData.length + forecastMonths - 1);
                        
                        return (
                          <Line
                            name="Trend Line"
                            type="monotone"
                            dataKey="value"
                            stroke={theme.palette.secondary.main}
                            strokeWidth={2}
                            dot={false}
                            data={[
                              { index: 0, value: lineStart },
                              { index: historicalData.length + forecastMonths - 1, value: lineEnd }
                            ]}
                            isAnimationActive={false}
                          />
                        );
                      })()}
                      
                      {/* Future projection area */}
                      <ReferenceArea
                        x1={historicalData.length - 1}
                        x2={historicalData.length + forecastMonths - 1}
                        strokeOpacity={0.3}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.1}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader 
                  title="Residual Analysis" 
                  titleTypographyProps={{ variant: 'h6' }}
                  subheader="Difference between actual values and regression line"
                />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer>
                        {(() => {
                          // Calculate residuals
                          const { slope, intercept } = linearRegression(historicalData);
                          const residualData = historicalData.map((item, index) => {
                            const predicted = intercept + slope * index;
                            const residual = item.revenue - predicted;
                            return {
                              ...item,
                              index,
                              predicted,
                              residual
                            };
                          });
                          
                          return (
                            <BarChart
                              data={residualData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis 
                                dataKey="index" 
                                tick={false}
                                stroke={theme.palette.text.secondary}
                                label={{ 
                                  value: 'Time (months)', 
                                  position: 'insideBottom', 
                                  offset: -10,
                                  fill: theme.palette.text.secondary 
                                }}
                              />
                              <YAxis 
                                tickFormatter={(value) => `$${value/1000}k`}
                                stroke={theme.palette.text.secondary}
                              />
                              <RechartsTooltip
                                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Residual']}
                                labelFormatter={(value) => `Month ${value}`}
                              />
                              <Legend />
                              <ReferenceLine y={0} stroke={theme.palette.text.secondary} />
                              <Bar 
                                dataKey="residual" 
                                name="Residual Error" 
                                fill={theme.palette.info.main}
                              >
                                {residualData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.residual >= 0 ? theme.palette.success.light : theme.palette.error.light}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          );
                        })()}
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardHeader 
                  title="Prediction Quality Metrics" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box>
                      <Grid container spacing={2}>
                        {predictionModels.map((model) => {
                          // Calculate MAPE (Mean Absolute Percentage Error)
                          const mape = (Math.random() * 10 + 5).toFixed(1); // Mock value
                          
                          // R-squared
                          const rSquared = model.accuracy.toFixed(2);
                          
                          return (
                            <Grid item xs={12} key={model.id}>
                              <Paper 
                                sx={{ 
                                  p: 2, 
                                  bgcolor: model.id === selectedModelId ? 'action.selected' : 'background.default',
                                  border: model.id === selectedModelId ? `1px solid ${theme.palette.primary.main}` : 'none'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle1">
                                    {model.name}
                                  </Typography>
                                  <Chip 
                                    label={model.id === selectedModelId ? "Selected" : "Available"}
                                    color={model.id === selectedModelId ? "primary" : "default"}
                                    size="small"
                                  />
                                </Box>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      R² (Coefficient of Determination)
                                    </Typography>
                                    <Typography variant="h6">
                                      {rSquared}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      MAPE (Mean Error %)
                                    </Typography>
                                    <Typography variant="h6">
                                      {mape}%
                                    </Typography>
                                  </Grid>
                                </Grid>
                                {model.id === selectedModelId && (
                                  <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    startIcon={<SettingsIcon />}
                                    onClick={() => setTabValue(0)}
                                  >
                                    Adjust Parameters
                                  </Button>
                                )}
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Scenario Comparison Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card elevation={1}>
            <CardHeader 
              title="Scenario Comparison" 
              subheader="Compare different business scenarios and their impact on revenue"
            />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="rectangular" height={400} />
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={[
                        ...historicalData,
                        ...generateForecast(historicalData, 'linear', forecastMonths, {
                          seasonality: 1.0,
                          growth: 0.9
                        }),
                        ...generateForecast(historicalData, 'linear', forecastMonths, {
                          seasonality: 1.0,
                          growth: 1.0
                        }),
                        ...generateForecast(historicalData, 'linear', forecastMonths, {
                          seasonality: 1.0,
                          growth: 1.1
                        })
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value/1000}k`}
                        stroke={theme.palette.text.secondary}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Historical"
                        stroke={theme.palette.grey[500]}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 8 }}
                        data={historicalData}
                      />
                      
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Pessimistic Scenario"
                        stroke={theme.palette.error.main}
                        strokeWidth={2}
                        dot={false}
                        data={generateForecast(historicalData, 'linear', forecastMonths, {
                          seasonality: 1.0,
                          growth: 0.9
                        })}
                      />
                      
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Base Scenario"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={false}
                        data={generateForecast(historicalData, 'linear', forecastMonths, {
                          seasonality: 1.0,
                          growth: 1.0
                        })}
                      />
                      
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Optimistic Scenario"
                        stroke={theme.palette.success.main}
                        strokeWidth={2}
                        dot={false}
                        data={generateForecast(historicalData, 'linear', forecastMonths, {
                          seasonality: 1.0,
                          growth: 1.1
                        })}
                      />
                      
                      <ReferenceLine
                        x={historicalData[historicalData.length - 1]?.formattedDate}
                        stroke={theme.palette.divider}
                        strokeWidth={2}
                        label={{
                          value: "Forecast Start",
                          position: "insideTopRight",
                          fill: theme.palette.text.secondary,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardHeader 
                  title="Scenario Comparison Table" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ overflow: 'auto' }}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={200} />
                  ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Scenario</TableCell>
                            <TableCell>Total Revenue</TableCell>
                            <TableCell>Growth Rate</TableCell>
                            <TableCell>Avg. Monthly</TableCell>
                            <TableCell>Peak Month</TableCell>
                            <TableCell>Risk Level</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { 
                              name: 'Pessimistic', 
                              totalRevenue: metrics.totalRevenue * 0.9,
                              growthRate: metrics.growthRate * 0.9,
                              monthlyAvg: metrics.averageMonthlyRevenue * 0.9,
                              peakMonth: 'Dec 2025',
                              risk: 'Low'
                            },
                            { 
                              name: 'Base Case', 
                              totalRevenue: metrics.totalRevenue,
                              growthRate: metrics.growthRate,
                              monthlyAvg: metrics.averageMonthlyRevenue,
                              peakMonth: 'Dec 2025',
                              risk: 'Medium'
                            },
                            { 
                              name: 'Optimistic', 
                              totalRevenue: metrics.totalRevenue * 1.1,
                              growthRate: metrics.growthRate * 1.1,
                              monthlyAvg: metrics.averageMonthlyRevenue * 1.1,
                              peakMonth: 'Dec 2025',
                              risk: 'High'
                            }
                          ].map((scenario) => (
                            <TableRow key={scenario.name}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {scenario.name}
                                </Typography>
                              </TableCell>
                              <TableCell>{formatCurrency(scenario.totalRevenue)}</TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color={scenario.growthRate > 0 ? "success.main" : "error.main"}
                                >
                                  {scenario.growthRate > 0 ? "+" : ""}{scenario.growthRate.toFixed(1)}%
                                </Typography>
                              </TableCell>
                              <TableCell>{formatCurrency(scenario.monthlyAvg)}</TableCell>
                              <TableCell>{scenario.peakMonth}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={scenario.risk} 
                                  color={
                                    scenario.risk === 'Low' ? 'success' :
                                    scenario.risk === 'Medium' ? 'primary' : 'error'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardHeader 
                  title="Forecast Assumptions" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" color="error.main" gutterBottom>
                          Pessimistic Scenario
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • Economic slowdown affecting consumer spending
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • Increased competition in key markets
                        </Typography>
                        <Typography variant="body2">
                          • Minimal marketing investment
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                          Base Case Scenario
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • Continuation of current market conditions
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • Stable customer acquisition rates
                        </Typography>
                        <Typography variant="body2">
                          • Planned marketing campaigns executed as scheduled
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" color="success.main" gutterBottom>
                          Optimistic Scenario
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • Successful product launches in Q3
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • Expanded market share in key regions
                        </Typography>
                        <Typography variant="body2">
                          • Increased marketing budget with higher ROI
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Predictions;