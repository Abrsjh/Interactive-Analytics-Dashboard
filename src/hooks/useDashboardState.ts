import { useCallback, useEffect, useReducer, useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';

// Types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CategoryFilter {
  id: string;
  values: string[];
}

export interface NumberRangeFilter {
  id: string;
  min: number | null;
  max: number | null;
}

export interface FilterState {
  dateRange: DateRange;
  categories: CategoryFilter[];
  numberRanges: NumberRangeFilter[];
  searchText: string;
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

export interface ViewState {
  activePage: string;
  comparisonMode: 'year' | 'month' | 'week' | 'day';
  timeGranularity: 'year' | 'quarter' | 'month' | 'week' | 'day';
  selectedMetrics: string[];
  showTrendIndicators: boolean;
  layout: Record<string, any>;
}

export interface DashboardState {
  filters: FilterState;
  view: ViewState;
}

// Actions
type FilterAction = 
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_CATEGORY_FILTER'; payload: CategoryFilter }
  | { type: 'REMOVE_CATEGORY_FILTER'; payload: string }
  | { type: 'SET_NUMBER_RANGE_FILTER'; payload: NumberRangeFilter }
  | { type: 'REMOVE_NUMBER_RANGE_FILTER'; payload: string }
  | { type: 'SET_SEARCH_TEXT'; payload: string }
  | { type: 'SET_SORT'; payload: { sortBy: string; sortDirection: 'asc' | 'desc' } }
  | { type: 'RESET_FILTERS' };

type ViewAction = 
  | { type: 'SET_ACTIVE_PAGE'; payload: string }
  | { type: 'SET_COMPARISON_MODE'; payload: ViewState['comparisonMode'] }
  | { type: 'SET_TIME_GRANULARITY'; payload: ViewState['timeGranularity'] }
  | { type: 'SET_SELECTED_METRICS'; payload: string[] }
  | { type: 'TOGGLE_METRIC'; payload: string }
  | { type: 'TOGGLE_TREND_INDICATORS' }
  | { type: 'UPDATE_LAYOUT'; payload: Record<string, any> }
  | { type: 'RESET_VIEW' };

type DashboardAction = 
  | { type: 'SET_FILTER'; payload: FilterAction }
  | { type: 'SET_VIEW'; payload: ViewAction }
  | { type: 'RESET_ALL' };

// Default state
const getDefaultFilterState = (): FilterState => {
  // Set default date range to last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return {
    dateRange: { startDate, endDate },
    categories: [],
    numberRanges: [],
    searchText: '',
    sortBy: null,
    sortDirection: 'desc'
  };
};

const getDefaultViewState = (): ViewState => {
  return {
    activePage: 'dashboard',
    comparisonMode: 'year',
    timeGranularity: 'month',
    selectedMetrics: ['revenue', 'profit', 'orders'],
    showTrendIndicators: true,
    layout: {}
  };
};

const getDefaultDashboardState = (): DashboardState => {
  return {
    filters: getDefaultFilterState(),
    view: getDefaultViewState()
  };
};

// Reducers
const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload
      };
    
    case 'SET_CATEGORY_FILTER': {
      const existingIndex = state.categories.findIndex(
        filter => filter.id === action.payload.id
      );
      
      const updatedCategories = [...state.categories];
      
      if (existingIndex >= 0) {
        updatedCategories[existingIndex] = action.payload;
      } else {
        updatedCategories.push(action.payload);
      }
      
      return {
        ...state,
        categories: updatedCategories
      };
    }
    
    case 'REMOVE_CATEGORY_FILTER':
      return {
        ...state,
        categories: state.categories.filter(filter => filter.id !== action.payload)
      };
    
    case 'SET_NUMBER_RANGE_FILTER': {
      const existingIndex = state.numberRanges.findIndex(
        filter => filter.id === action.payload.id
      );
      
      const updatedRanges = [...state.numberRanges];
      
      if (existingIndex >= 0) {
        updatedRanges[existingIndex] = action.payload;
      } else {
        updatedRanges.push(action.payload);
      }
      
      return {
        ...state,
        numberRanges: updatedRanges
      };
    }
    
    case 'REMOVE_NUMBER_RANGE_FILTER':
      return {
        ...state,
        numberRanges: state.numberRanges.filter(filter => filter.id !== action.payload)
      };
    
    case 'SET_SEARCH_TEXT':
      return {
        ...state,
        searchText: action.payload
      };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortDirection: action.payload.sortDirection
      };
    
    case 'RESET_FILTERS':
      return getDefaultFilterState();
    
    default:
      return state;
  }
};

const viewReducer = (state: ViewState, action: ViewAction): ViewState => {
  switch (action.type) {
    case 'SET_ACTIVE_PAGE':
      return {
        ...state,
        activePage: action.payload
      };
    
    case 'SET_COMPARISON_MODE':
      return {
        ...state,
        comparisonMode: action.payload
      };
    
    case 'SET_TIME_GRANULARITY':
      return {
        ...state,
        timeGranularity: action.payload
      };
    
    case 'SET_SELECTED_METRICS':
      return {
        ...state,
        selectedMetrics: action.payload
      };
    
    case 'TOGGLE_METRIC': {
      const metrics = [...state.selectedMetrics];
      const index = metrics.indexOf(action.payload);
      
      if (index >= 0) {
        metrics.splice(index, 1);
      } else {
        metrics.push(action.payload);
      }
      
      return {
        ...state,
        selectedMetrics: metrics
      };
    }
    
    case 'TOGGLE_TREND_INDICATORS':
      return {
        ...state,
        showTrendIndicators: !state.showTrendIndicators
      };
    
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layout: {
          ...state.layout,
          ...action.payload
        }
      };
    
    case 'RESET_VIEW':
      return getDefaultViewState();
    
    default:
      return state;
  }
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: filterReducer(state.filters, action.payload)
      };
    
    case 'SET_VIEW':
      return {
        ...state,
        view: viewReducer(state.view, action.payload)
      };
    
    case 'RESET_ALL':
      return getDefaultDashboardState();
    
    default:
      return state;
  }
};

/**
 * A hook for managing dashboard state including filters, view options, and layout
 */
export function useDashboardState() {
  // Get global state for user preferences
  const { state: globalState } = useGlobalState();
  
  // Initialize with default state
  const [state, dispatch] = useReducer(dashboardReducer, getDefaultDashboardState());
  
  // Debounced search text to avoid too frequent filtering
  const [debouncedSearchText, setDebouncedSearchText] = useState(state.filters.searchText);
  
  // Apply search text debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(state.filters.searchText);
    }, 300); // 300ms debounce delay
    
    return () => {
      clearTimeout(handler);
    };
  }, [state.filters.searchText]);
  
  // Sync with user preferences from global state when they change
  useEffect(() => {
    if (globalState.userPreferences.defaultView) {
      dispatch({
        type: 'SET_VIEW',
        payload: { type: 'SET_ACTIVE_PAGE', payload: globalState.userPreferences.defaultView }
      });
    }
    
    // Other preference syncing can be added here
  }, [globalState.userPreferences]);
  
  // Filter actions
  const setDateRange = useCallback((dateRange: DateRange) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'SET_DATE_RANGE', payload: dateRange }
    });
  }, []);
  
  const setCategoryFilter = useCallback((filter: CategoryFilter) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'SET_CATEGORY_FILTER', payload: filter }
    });
  }, []);
  
  const removeCategoryFilter = useCallback((id: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'REMOVE_CATEGORY_FILTER', payload: id }
    });
  }, []);
  
  const setNumberRangeFilter = useCallback((filter: NumberRangeFilter) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'SET_NUMBER_RANGE_FILTER', payload: filter }
    });
  }, []);
  
  const removeNumberRangeFilter = useCallback((id: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'REMOVE_NUMBER_RANGE_FILTER', payload: id }
    });
  }, []);
  
  const setSearchText = useCallback((text: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'SET_SEARCH_TEXT', payload: text }
    });
  }, []);
  
  const setSort = useCallback((sortBy: string, sortDirection: 'asc' | 'desc' = 'asc') => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'SET_SORT', payload: { sortBy, sortDirection } }
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    dispatch({
      type: 'SET_FILTER',
      payload: { type: 'RESET_FILTERS' }
    });
  }, []);
  
  // View actions
  const setActivePage = useCallback((page: string) => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'SET_ACTIVE_PAGE', payload: page }
    });
  }, []);
  
  const setComparisonMode = useCallback((mode: ViewState['comparisonMode']) => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'SET_COMPARISON_MODE', payload: mode }
    });
  }, []);
  
  const setTimeGranularity = useCallback((granularity: ViewState['timeGranularity']) => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'SET_TIME_GRANULARITY', payload: granularity }
    });
  }, []);
  
  const setSelectedMetrics = useCallback((metrics: string[]) => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'SET_SELECTED_METRICS', payload: metrics }
    });
  }, []);
  
  const toggleMetric = useCallback((metric: string) => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'TOGGLE_METRIC', payload: metric }
    });
  }, []);
  
  const toggleTrendIndicators = useCallback(() => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'TOGGLE_TREND_INDICATORS' }
    });
  }, []);
  
  const updateLayout = useCallback((layout: Record<string, any>) => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'UPDATE_LAYOUT', payload: layout }
    });
  }, []);
  
  const resetView = useCallback(() => {
    dispatch({
      type: 'SET_VIEW',
      payload: { type: 'RESET_VIEW' }
    });
  }, []);
  
  // Dashboard actions
  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);
  
  // Helper functions
  const isFilterActive = useCallback(() => {
    return (
      state.filters.categories.length > 0 ||
      state.filters.numberRanges.length > 0 ||
      state.filters.searchText.length > 0 ||
      // Check if date range is different from default (last 30 days)
      Math.abs(
        (state.filters.dateRange.endDate.getTime() - state.filters.dateRange.startDate.getTime()) / 
        (1000 * 60 * 60 * 24) - 30
      ) > 1
    );
  }, [state.filters]);
  
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    
    if (state.filters.categories.length > 0) count += state.filters.categories.length;
    if (state.filters.numberRanges.length > 0) count += state.filters.numberRanges.length;
    if (state.filters.searchText.length > 0) count += 1;
    
    // Check if date range is different from default (last 30 days)
    if (Math.abs(
      (state.filters.dateRange.endDate.getTime() - state.filters.dateRange.startDate.getTime()) / 
      (1000 * 60 * 60 * 24) - 30
    ) > 1) {
      count += 1;
    }
    
    return count;
  }, [state.filters]);
  
  // Apply filters to a dataset
  const applyFilters = useCallback(<T extends Record<string, any>>(
    data: T[],
    options: {
      dateField?: string;
      categoryFields?: Record<string, string>;
      numberFields?: Record<string, string>;
      searchFields?: string[];
    } = {}
  ): T[] => {
    const {
      dateField = 'date',
      categoryFields = {},
      numberFields = {},
      searchFields = []
    } = options;
    
    return data.filter(item => {
      // Date range filter
      if (dateField && item[dateField]) {
        const itemDate = new Date(item[dateField]);
        if (
          itemDate < state.filters.dateRange.startDate ||
          itemDate > state.filters.dateRange.endDate
        ) {
          return false;
        }
      }
      
      // Category filters
      for (const filter of state.filters.categories) {
        const fieldName = categoryFields[filter.id] || filter.id;
        if (
          item[fieldName] !== undefined &&
          filter.values.length > 0 &&
          !filter.values.includes(String(item[fieldName]))
        ) {
          return false;
        }
      }
      
      // Number range filters
      for (const filter of state.filters.numberRanges) {
        const fieldName = numberFields[filter.id] || filter.id;
        const value = Number(item[fieldName]);
        
        if (
          !isNaN(value) &&
          ((filter.min !== null && value < filter.min) ||
           (filter.max !== null && value > filter.max))
        ) {
          return false;
        }
      }
      
      // Search text filter
      if (debouncedSearchText && searchFields.length > 0) {
        const searchLower = debouncedSearchText.toLowerCase();
        const matchesSearch = searchFields.some(field => {
          const value = item[field];
          return value !== undefined && 
                 String(value).toLowerCase().includes(searchLower);
        });
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [
    state.filters.dateRange,
    state.filters.categories,
    state.filters.numberRanges,
    debouncedSearchText
  ]);
  
  // Sort data based on current sort settings
  const sortData = useCallback(<T extends Record<string, any>>(
    data: T[],
    options: {
      fieldMap?: Record<string, string>;
    } = {}
  ): T[] => {
    const { fieldMap = {} } = options;
    
    if (!state.filters.sortBy) return data;
    
    const sortField = fieldMap[state.filters.sortBy] || state.filters.sortBy;
    const sortDirection = state.filters.sortDirection;
    
    return [...data].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (valueA === valueB) return 0;
      
      const directionFactor = sortDirection === 'asc' ? 1 : -1;
      
      if (valueA === null || valueA === undefined) return 1 * directionFactor;
      if (valueB === null || valueB === undefined) return -1 * directionFactor;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * directionFactor;
      }
      
      return (valueA > valueB ? 1 : -1) * directionFactor;
    });
  }, [state.filters.sortBy, state.filters.sortDirection]);
  
  return {
    state,
    filters: state.filters,
    view: state.view,
    debouncedSearchText,
    
    // Filter actions
    setDateRange,
    setCategoryFilter,
    removeCategoryFilter,
    setNumberRangeFilter,
    removeNumberRangeFilter,
    setSearchText,
    setSort,
    resetFilters,
    
    // View actions
    setActivePage,
    setComparisonMode,
    setTimeGranularity,
    setSelectedMetrics,
    toggleMetric,
    toggleTrendIndicators,
    updateLayout,
    resetView,
    
    // Dashboard actions
    resetAll,
    
    // Helper functions
    isFilterActive,
    getActiveFiltersCount,
    applyFilters,
    sortData
  };
}

export default useDashboardState;