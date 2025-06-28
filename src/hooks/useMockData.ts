import { useState, useEffect, useCallback } from 'react';
import { useData, UseDataOptions, UseDataResult } from './useData';
import * as mockDataService from '../services/mockData';

/**
 * Mock data types that can be generated
 */
export type MockDataType = 
  | 'sales'
  | 'geographic'
  | 'kpi'
  | 'transactions'
  | 'categories'
  | 'forecast'
  | 'timeSeries'
  | 'dashboard';

/**
 * Options for mock data generation
 */
export interface MockDataOptions<T> extends Omit<UseDataOptions<T>, 'customFetch'> {
  /** Delay to simulate network latency (ms) */
  delay?: number;
  /** Whether to simulate random errors */
  simulateErrors?: boolean;
  /** Error probability (0-1) if simulateErrors is true */
  errorProbability?: number;
  /** Custom parameters for specific data types */
  params?: Record<string, any>;
}

/**
 * A hook for generating and accessing mock data for development and testing
 * 
 * @param dataType The type of mock data to generate
 * @param options Configuration options
 * @returns The same result structure as useData
 * 
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useMockData('sales');
 * 
 * @example
 * // With custom parameters
 * const { data } = useMockData('timeSeries', {
 *   params: {
 *     metrics: ['revenue', 'profit', 'costs'],
 *     days: 90,
 *     interval: 'day'
 *   }
 * });
 */
export function useMockData<T = any>(
  dataType: MockDataType,
  options: MockDataOptions<T> = {}
): UseDataResult<T> {
  const {
    delay = 500,
    simulateErrors = false,
    errorProbability = 0.1,
    params = {},
    ...dataOptions
  } = options;

  // Create a fetch function that returns mock data
  const mockFetch = useCallback(async (): Promise<T> => {
    // Simulate network delay
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Simulate random errors if enabled
    if (simulateErrors && Math.random() < errorProbability) {
      throw {
        message: 'Simulated mock data error',
        status: 500,
        isAxiosError: true
      };
    }

    // Generate the appropriate mock data based on the type
    let result: any;

    switch (dataType) {
      case 'sales':
        result = mockDataService.generateSalesData(
          params.startDate,
          params.days,
          params.interval
        );
        break;

      case 'geographic':
        result = mockDataService.generateGeographicData();
        break;

      case 'kpi':
        result = mockDataService.generateKpiMetrics();
        break;

      case 'transactions':
        result = mockDataService.generateTransactionData(
          params.count || 100
        );
        break;

      case 'categories':
        result = mockDataService.generateCategoryData();
        break;

      case 'forecast':
        // If historical data is provided, use it for the forecast
        const historicalData = params.historicalData || 
          mockDataService.generateSalesData(undefined, 365);
        
        result = mockDataService.generateForecastData(
          historicalData,
          params.forecastDays || 90
        );
        break;

      case 'timeSeries':
        result = mockDataService.generateTimeSeriesData(
          params.metrics || ['value'],
          params.startDate,
          params.days || 30,
          params.interval || 'day'
        );
        break;

      case 'dashboard':
        result = mockDataService.generateDashboardData();
        break;

      default:
        throw new Error(`Unknown mock data type: ${dataType}`);
    }

    return result as T;
  }, [dataType, delay, simulateErrors, errorProbability, params]);

  // Use the generic useData hook with our custom fetch function
  return useData<T>('', {
    ...dataOptions,
    customFetch: mockFetch,
  });
}

/**
 * A hook to access mock sales data
 */
export function useMockSalesData(options: MockDataOptions<mockDataService.SalesDataPoint[]> = {}) {
  return useMockData<mockDataService.SalesDataPoint[]>('sales', options);
}

/**
 * A hook to access mock geographic data
 */
export function useMockGeographicData(options: MockDataOptions<mockDataService.GeographicDataPoint[]> = {}) {
  return useMockData<mockDataService.GeographicDataPoint[]>('geographic', options);
}

/**
 * A hook to access mock KPI metrics
 */
export function useMockKpiData(options: MockDataOptions<mockDataService.KpiMetric[]> = {}) {
  return useMockData<mockDataService.KpiMetric[]>('kpi', options);
}

/**
 * A hook to access mock transaction data
 */
export function useMockTransactionData(options: MockDataOptions<mockDataService.TransactionRecord[]> = {}) {
  return useMockData<mockDataService.TransactionRecord[]>('transactions', options);
}

/**
 * A hook to access mock category data
 */
export function useMockCategoryData(options: MockDataOptions<mockDataService.CategoryData[]> = {}) {
  return useMockData<mockDataService.CategoryData[]>('categories', options);
}

/**
 * A hook to access mock forecast data
 */
export function useMockForecastData(options: MockDataOptions<mockDataService.SalesDataPoint[]> = {}) {
  return useMockData<mockDataService.SalesDataPoint[]>('forecast', options);
}

/**
 * A hook to access all dashboard data at once
 */
export function useMockDashboardData(options: MockDataOptions<any> = {}) {
  return useMockData('dashboard', options);
}

export default useMockData;