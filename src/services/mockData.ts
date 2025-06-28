/**
 * Mock Data Generation Service
 * 
 * This service generates realistic sample data for development and testing
 * of the analytics dashboard. It includes functions to create:
 * - Sales/revenue data
 * - Geographic distribution data
 * - KPI metrics
 * - Transaction records
 * - Time series data for forecasting
 */

// Types
export interface SalesDataPoint {
  date: string;
  revenue: number;
  profit: number;
  costs: number;
  transactions: number;
  marketingSpend: number;
}

export interface GeographicDataPoint {
  id: string;
  name: string;
  value: number;
  latitude?: number;
  longitude?: number;
  change?: number;
  percentOfTotal?: number;
}

export interface KpiMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: number[];
  format: string;
  color?: string;
}

export interface TransactionRecord {
  id: string;
  date: string;
  customer: string;
  product: string;
  category: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  location: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: any;
}

// Utility functions
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomFloat = (min: number, max: number, decimals = 2): number => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

const randomChange = (baseValue: number, maxPercentChange = 0.2): number => {
  const percentChange = randomFloat(-maxPercentChange, maxPercentChange);
  return baseValue * (1 + percentChange);
};

const randomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate a series of dates
const generateDateSeries = (
  startDate: Date,
  days: number,
  interval: 'day' | 'week' | 'month' = 'day'
): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    dates.push(new Date(currentDate));

    // Advance by the specified interval
    switch (interval) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }

  return dates;
};

// Sample data constants
const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Home Goods', 'Books', 'Food & Beverage',
  'Health & Beauty', 'Sports & Outdoors', 'Toys & Games', 'Automotive', 'Office Supplies'
];

const PAYMENT_METHODS = [
  'Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay',
  'Cryptocurrency', 'Gift Card', 'Store Credit', 'Cash', 'Financing'
];

const STATUS_OPTIONS = ['completed', 'pending', 'failed', 'refunded'] as const;

const CUSTOMER_FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Margaret', 'Mark', 'Betty', 'Donald', 'Sandra', 'Steven', 'Ashley',
  'Andrew', 'Dorothy', 'Paul', 'Kimberly', 'Joshua', 'Emily', 'Kenneth', 'Donna'
];

const CUSTOMER_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const CITY_NAMES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle',
  'Denver', 'Boston', 'Portland', 'Nashville', 'Memphis', 'Atlanta', 'Miami'
];

const PRODUCT_NAMES = [
  'Premium Headphones', 'Bluetooth Speaker', 'Smartphone Case', 'Wireless Mouse',
  'USB-C Cable', 'Laptop Stand', 'Mechanical Keyboard', 'External SSD',
  'Power Bank', 'Wireless Charger', 'Smart Watch', 'Fitness Tracker',
  'Desk Lamp', 'Backpack', 'Water Bottle', 'Coffee Mug', 'Notebook',
  'Pen Set', 'Desktop Organizer', 'Monitor Stand', 'Webcam Cover',
  'Screen Protector', 'Phone Grip', 'Ergonomic Chair', 'Standing Desk'
];

// US States data for geographic visualization
const US_STATES = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' },
  { id: 'DC', name: 'District of Columbia' }
];

/**
 * Generate time series sales data for a given date range
 */
export const generateSalesData = (
  startDate: Date = new Date(new Date().getFullYear(), 0, 1), // Default to Jan 1 of current year
  days: number = 365,
  interval: 'day' | 'week' | 'month' = 'day'
): SalesDataPoint[] => {
  const dates = generateDateSeries(startDate, days, interval);
  const baseRevenue = randomBetween(10000, 50000);
  const baseCosts = baseRevenue * randomFloat(0.4, 0.7);
  const baseTransactions = randomBetween(100, 500);
  const baseMarketingSpend = baseRevenue * randomFloat(0.05, 0.15);

  // Define seasonality factors (higher in Q4, lower in Q1)
  const getSeasonalFactor = (date: Date): number => {
    const month = date.getMonth();
    // Q4 (Oct-Dec) has higher sales
    if (month >= 9 && month <= 11) return randomFloat(1.2, 1.5);
    // Q1 (Jan-Mar) has lower sales
    if (month >= 0 && month <= 2) return randomFloat(0.7, 0.9);
    // Q2-Q3 have average sales
    return randomFloat(0.9, 1.1);
  };

  // Define weekly pattern (weekends have different patterns)
  const getWeekdayFactor = (date: Date): number => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) return randomFloat(0.7, 1.3); // Weekend
    return randomFloat(0.9, 1.1); // Weekday
  };

  // Generate a growth trend over time
  const getTrendFactor = (index: number, total: number): number => {
    // Annual growth of 5-15%
    const annualGrowthRate = randomFloat(0.05, 0.15);
    // Convert to per-day/week/month growth rate
    const growthPerPeriod = Math.pow(1 + annualGrowthRate, 1 / total);
    return Math.pow(growthPerPeriod, index);
  };

  return dates.map((date, index) => {
    // Apply seasonality, weekly patterns, and growth trend
    const seasonalFactor = getSeasonalFactor(date);
    const weekdayFactor = getWeekdayFactor(date);
    const trendFactor = getTrendFactor(index, dates.length);
    
    // Calculate metrics with some randomness and the above factors
    const variabilityFactor = randomFloat(0.9, 1.1);
    const revenue = baseRevenue * seasonalFactor * weekdayFactor * trendFactor * variabilityFactor;
    
    // Costs are somewhat correlated with revenue but have their own variability
    const costFactor = randomFloat(0.9, 1.1);
    const costs = baseCosts * seasonalFactor * trendFactor * costFactor;
    
    // Profit derived from revenue and costs
    const profit = revenue - costs;
    
    // Transactions follow similar patterns to revenue
    const transactionFactor = randomFloat(0.9, 1.1);
    const transactions = Math.round(baseTransactions * seasonalFactor * weekdayFactor * trendFactor * transactionFactor);
    
    // Marketing spend might be higher in certain seasons
    const marketingFactor = seasonalFactor > 1 ? randomFloat(1.1, 1.3) : randomFloat(0.9, 1.1);
    const marketingSpend = baseMarketingSpend * seasonalFactor * trendFactor * marketingFactor;

    return {
      date: dateToString(date),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      costs: Math.round(costs),
      transactions: transactions,
      marketingSpend: Math.round(marketingSpend)
    };
  });
};

/**
 * Generate geographic data for states with sales values
 */
export const generateGeographicData = (): GeographicDataPoint[] => {
  // Calculate total for percentage calculations
  let total = 0;
  const statesWithValues = US_STATES.map(state => {
    // Population-based weighting (simplified approximation)
    let baseValue: number;
    
    // High population states
    if (['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'].includes(state.id)) {
      baseValue = randomBetween(500000, 2000000);
    } 
    // Medium population states
    else if (['NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY'].includes(state.id)) {
      baseValue = randomBetween(200000, 800000);
    } 
    // Lower population states
    else {
      baseValue = randomBetween(50000, 400000);
    }
    
    const value = baseValue * randomFloat(0.8, 1.2);
    total += value;
    
    return {
      ...state,
      value: Math.round(value),
      change: randomFloat(-15, 25, 1),
    };
  });
  
  // Add percentOfTotal
  return statesWithValues.map(state => ({
    ...state,
    percentOfTotal: parseFloat(((state.value / total) * 100).toFixed(1))
  }));
};

/**
 * Generate KPI metrics for dashboard
 */
export const generateKpiMetrics = (): KpiMetric[] => {
  const generateTrend = (points: number = 7, trend: 'up' | 'down' | 'volatile' | 'stable' = 'volatile'): number[] => {
    const result: number[] = [];
    let current = 100;
    
    for (let i = 0; i < points; i++) {
      switch (trend) {
        case 'up':
          current *= randomFloat(1.01, 1.05);
          break;
        case 'down':
          current *= randomFloat(0.95, 0.99);
          break;
        case 'volatile':
          current *= randomFloat(0.92, 1.08);
          break;
        case 'stable':
          current *= randomFloat(0.99, 1.01);
          break;
      }
      result.push(Math.round(current));
    }
    
    return result;
  };

  return [
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: randomBetween(1500000, 2500000),
      previousValue: randomBetween(1400000, 2300000),
      change: 0, // Calculated below
      changePercent: 0, // Calculated below
      trend: generateTrend(7, 'up'),
      format: 'currency'
    },
    {
      id: 'profit',
      name: 'Net Profit',
      value: randomBetween(300000, 700000),
      previousValue: randomBetween(280000, 650000),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'up'),
      format: 'currency'
    },
    {
      id: 'margin',
      name: 'Profit Margin',
      value: randomFloat(15, 35, 1),
      previousValue: randomFloat(14, 33, 1),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'stable'),
      format: 'percent'
    },
    {
      id: 'customers',
      name: 'Active Customers',
      value: randomBetween(15000, 25000),
      previousValue: randomBetween(14000, 24000),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'up'),
      format: 'number'
    },
    {
      id: 'orders',
      name: 'Orders',
      value: randomBetween(40000, 60000),
      previousValue: randomBetween(38000, 58000),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'volatile'),
      format: 'number'
    },
    {
      id: 'aov',
      name: 'Avg. Order Value',
      value: randomBetween(120, 200),
      previousValue: randomBetween(115, 190),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'stable'),
      format: 'currency'
    },
    {
      id: 'conversion',
      name: 'Conversion Rate',
      value: randomFloat(2, 5, 2),
      previousValue: randomFloat(1.8, 4.8, 2),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'volatile'),
      format: 'percent'
    },
    {
      id: 'cac',
      name: 'Customer Acq. Cost',
      value: randomBetween(30, 70),
      previousValue: randomBetween(32, 75),
      change: 0,
      changePercent: 0,
      trend: generateTrend(7, 'down'),
      format: 'currency'
    }
  ].map(metric => {
    // Calculate change and change percent
    const change = metric.value - metric.previousValue;
    const changePercent = (change / metric.previousValue) * 100;
    
    // Determine color based on metric type and change
    let color;
    if (metric.id === 'cac') {
      // For cost metrics, lower is better
      color = change < 0 ? 'success' : 'error';
    } else {
      // For most metrics, higher is better
      color = change > 0 ? 'success' : 'error';
    }
    
    return {
      ...metric,
      change,
      changePercent: parseFloat(changePercent.toFixed(1)),
      color
    };
  });
};

/**
 * Generate transaction records for the data table
 */
export const generateTransactionData = (count: number = 100): TransactionRecord[] => {
  const transactions: TransactionRecord[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30); // Last 30 days
  
  for (let i = 0; i < count; i++) {
    // Generate a random date within the last 30 days
    const transactionDate = new Date(startDate);
    transactionDate.setDate(startDate.getDate() + randomBetween(0, 30));
    
    // Generate random customer name
    const firstName = randomFromArray(CUSTOMER_FIRST_NAMES);
    const lastName = randomFromArray(CUSTOMER_LAST_NAMES);
    const customer = `${firstName} ${lastName}`;
    
    // Generate random product and category
    const category = randomFromArray(PRODUCT_CATEGORIES);
    const product = randomFromArray(PRODUCT_NAMES);
    
    // Generate random amount based on product category
    let amount: number;
    switch (category) {
      case 'Electronics':
        amount = randomBetween(100, 1500);
        break;
      case 'Clothing':
        amount = randomBetween(20, 200);
        break;
      case 'Food & Beverage':
        amount = randomBetween(10, 50);
        break;
      default:
        amount = randomBetween(15, 300);
    }
    
    // Generate random status with weighted probabilities
    const statusRandom = Math.random();
    let status: typeof STATUS_OPTIONS[number];
    if (statusRandom < 0.85) {
      status = 'completed';
    } else if (statusRandom < 0.92) {
      status = 'pending';
    } else if (statusRandom < 0.97) {
      status = 'failed';
    } else {
      status = 'refunded';
    }
    
    transactions.push({
      id: `TRX-${randomBetween(10000, 99999)}`,
      date: dateToString(transactionDate),
      customer,
      product,
      category,
      amount,
      status,
      paymentMethod: randomFromArray(PAYMENT_METHODS),
      location: randomFromArray(CITY_NAMES)
    });
  }
  
  // Sort by date, most recent first
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Generate category sales data for pie charts
 */
export const generateCategoryData = (): CategoryData[] => {
  return PRODUCT_CATEGORIES.map(category => ({
    name: category,
    value: randomBetween(50000, 500000)
  }));
};

/**
 * Generate time series data for multiple metrics
 */
export const generateTimeSeriesData = (
  metrics: string[],
  startDate: Date = new Date(new Date().getFullYear(), 0, 1), // Default to Jan 1 of current year
  days: number = 30,
  interval: 'day' | 'week' | 'month' = 'day'
): TimeSeriesDataPoint[] => {
  const dates = generateDateSeries(startDate, days, interval);
  
  // Create base values for each metric
  const baseValues: Record<string, number> = {};
  metrics.forEach(metric => {
    baseValues[metric] = randomBetween(100, 1000);
  });
  
  return dates.map((date, index) => {
    const dataPoint: TimeSeriesDataPoint = {
      date: dateToString(date)
    };
    
    // Generate value for each metric with some trend and randomness
    metrics.forEach(metric => {
      const trendFactor = 1 + (index / days) * randomFloat(-0.2, 0.2);
      const randomFactor = randomFloat(0.9, 1.1);
      dataPoint[metric] = Math.round(baseValues[metric] * trendFactor * randomFactor);
    });
    
    return dataPoint;
  });
};

/**
 * Generate sales forecast data based on historical data and simple regression
 */
export const generateForecastData = (
  historicalData: SalesDataPoint[],
  forecastDays: number = 90
): SalesDataPoint[] => {
  if (historicalData.length === 0) return [];
  
  // Get the last date in historical data
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const startDate = new Date(lastDate);
  startDate.setDate(startDate.getDate() + 1); // Start forecast from the next day
  
  // Generate dates for forecast period
  const forecastDates = generateDateSeries(startDate, forecastDays, 'day');
  
  // Calculate average daily growth rate from historical data
  const firstValue = historicalData[0].revenue;
  const lastValue = historicalData[historicalData.length - 1].revenue;
  const growthRate = Math.pow(lastValue / firstValue, 1 / historicalData.length) - 1;
  
  // Generate forecast with some random variation
  return forecastDates.map((date, index) => {
    // Base forecast with consistent growth
    const baseRevenue = lastValue * Math.pow(1 + growthRate, index + 1);
    
    // Add seasonal and random factors
    const month = date.getMonth();
    let seasonalFactor = 1;
    
    // Q4 (Oct-Dec) has higher sales
    if (month >= 9 && month <= 11) seasonalFactor = randomFloat(1.1, 1.2);
    // Q1 (Jan-Mar) has lower sales
    else if (month >= 0 && month <= 2) seasonalFactor = randomFloat(0.8, 0.9);
    
    // Add some random noise
    const randomFactor = randomFloat(0.95, 1.05);
    
    // Calculate revenue with factors
    const revenue = baseRevenue * seasonalFactor * randomFactor;
    
    // Derive other metrics based on revenue
    const costs = revenue * randomFloat(0.5, 0.7);
    const profit = revenue - costs;
    const transactions = Math.round(revenue / randomFloat(80, 120));
    const marketingSpend = revenue * randomFloat(0.05, 0.15);
    
    return {
      date: dateToString(date),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      costs: Math.round(costs),
      transactions,
      marketingSpend: Math.round(marketingSpend)
    };
  });
};

/**
 * Generate all data needed for the dashboard in one call
 */
export const generateDashboardData = () => {
  const salesData = generateSalesData();
  const lastMonthSalesData = salesData.slice(-30);
  const geographicData = generateGeographicData();
  const kpiMetrics = generateKpiMetrics();
  const transactionData = generateTransactionData(100);
  const categoryData = generateCategoryData();
  const forecastData = generateForecastData(salesData, 90);

  return {
    salesData,
    lastMonthSalesData,
    geographicData,
    kpiMetrics,
    transactionData,
    categoryData,
    forecastData
  };
};