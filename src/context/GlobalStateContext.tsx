import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define types for our state
export interface DashboardFilter {
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
  categories?: string[];
  regions?: string[];
  search?: string;
}

export interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface GlobalState {
  filters: DashboardFilter;
  layouts: {
    [key: string]: WidgetLayout[];
  };
  refreshInterval: number; // in milliseconds
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  userPreferences: {
    showTooltips: boolean;
    autoRefresh: boolean;
    defaultView: string;
  };
}

// Define action types
type ActionType =
  | { type: 'SET_FILTERS'; payload: DashboardFilter }
  | { type: 'UPDATE_FILTER'; payload: { key: keyof DashboardFilter; value: any } }
  | { type: 'SAVE_LAYOUT'; payload: { dashboard: string; layouts: WidgetLayout[] } }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_LAST_UPDATED' }
  | { type: 'UPDATE_USER_PREFERENCE'; payload: { key: keyof GlobalState['userPreferences']; value: any } };

// Initial state
const initialState: GlobalState = {
  filters: {
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
      endDate: new Date(),
    },
    categories: [],
    regions: [],
    search: '',
  },
  layouts: {
    default: [],
  },
  refreshInterval: 300000, // 5 minutes by default
  isLoading: false,
  error: null,
  lastUpdated: null,
  userPreferences: {
    showTooltips: true,
    autoRefresh: true,
    defaultView: 'sales',
  },
};

// Reducer function
const reducer = (state: GlobalState, action: ActionType): GlobalState => {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
      };
    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'SAVE_LAYOUT':
      return {
        ...state,
        layouts: {
          ...state.layouts,
          [action.payload.dashboard]: action.payload.layouts,
        },
      };
    case 'SET_REFRESH_INTERVAL':
      return {
        ...state,
        refreshInterval: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'UPDATE_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: new Date(),
      };
    case 'UPDATE_USER_PREFERENCE':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
};

// Create context
type GlobalContextType = {
  state: GlobalState;
  dispatch: React.Dispatch<ActionType>;
};

const GlobalStateContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component
interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hook for consuming the context
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};