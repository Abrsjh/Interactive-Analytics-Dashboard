import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  TablePagination,
  Chip,
  LinearProgress,
  useTheme,
  Checkbox,
  Menu,
  MenuItem,
  Button,
  Divider,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  ArrowDownward as ArrowDownwardIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { TableVirtuoso } from 'react-virtuoso';

// Types
export type ColumnType<T> = {
  id: string;
  label: string;
  width?: number | string;
  minWidth?: number;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  renderCell?: (row: T) => React.ReactNode;
  renderEditCell?: (row: T, onSave: (updatedRow: T) => void) => React.ReactNode;
  disablePadding?: boolean;
};

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: ColumnType<T>[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  selectable?: boolean;
  rowKey?: string;
  height?: number | string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onRefresh?: () => void;
  onRowEdit?: (updatedRow: T) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  actions?: React.ReactNode;
  pagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  virtualScroll?: boolean;
  emptyContent?: React.ReactNode;
  onSort?: (sortConfig: SortConfig) => void;
  defaultSort?: SortConfig;
}

/**
 * Advanced data table component with sorting, filtering, pagination, and more
 */
function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  loading = false,
  error = null,
  selectable = false,
  rowKey = 'id',
  height = 400,
  onRowClick,
  onSelectionChange,
  onRefresh,
  onRowEdit,
  onFilterChange,
  actions,
  pagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  virtualScroll = false,
  emptyContent,
  onSort,
  defaultSort,
}: DataTableProps<T>) {
  const theme = useTheme();
  
  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(defaultSort);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchText, setSearchText] = useState('');
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | { el: HTMLElement; row: T }>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(column => !column.hidden).map(column => column.id)
  );

  // Reference for table virtualization
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Effect to notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = data.filter(row => selected.includes(String(row[rowKey])));
      onSelectionChange(selectedRows);
    }
  }, [selected, data, rowKey, onSelectionChange]);

  // Effect to notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ ...filters, searchText });
    }
  }, [filters, searchText, onFilterChange]);

  // Display data with sorting and filtering applied
  const displayData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(row => {
        return columns.some(column => {
          const value = row[column.id];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredData = filteredData.filter(row => {
          const cellValue = row[key];
          if (typeof value === 'string') {
            return String(cellValue).toLowerCase().includes(value.toLowerCase());
          }
          return cellValue === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];
        
        if (valueA === valueB) {
          return 0;
        }
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (valueA === null || valueA === undefined) {
          return 1 * direction;
        }
        
        if (valueB === null || valueB === undefined) {
          return -1 * direction;
        }
        
        return (
          (typeof valueA === 'string' 
            ? valueA.localeCompare(valueB) 
            : valueA > valueB ? 1 : -1
          ) * direction
        );
      });
    }

    return filteredData;
  }, [data, columns, searchText, filters, sortConfig]);

  // Pagination sliced data
  const paginatedData = useMemo(() => {
    if (!pagination) return displayData;
    return displayData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [displayData, pagination, page, rowsPerPage]);


  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = sortConfig?.key === property && sortConfig.direction === 'asc';
    const newSortConfig: SortConfig = { key: property, direction: isAsc ? 'desc' : 'asc' };
    setSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig);
    }
  };

  // Handle row selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedData.map((row: T) => String(row[rowKey]));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Handle click on checkbox
  const handleCheckboxClick = (_event: React.MouseEvent, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item: string) => item !== id);
    }
    
    setSelected(newSelected);
  };

  // Handle row click
  const handleRowClick = (event: React.MouseEvent, row: T) => {
    if (!onRowClick || editingRow === String(row[rowKey])) return;
    
    // Ignore clicks on checkbox, edit button, etc.
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    
    onRowClick(row);
  };

  // Handle row edit
  const handleRowEdit = (row: T) => {
    setEditingRow(String(row[rowKey]));
  };

  // Handle save after row edit
  const handleSaveRow = (updatedRow: T) => {
    if (onRowEdit) {
      onRowEdit(updatedRow);
    }
    setEditingRow(null);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (columnId: string, value: any) => {
    setFilters((prev: Record<string, any>) => ({
      ...prev,
      [columnId]: value,
    }));
    setPage(0);
  };

  // Handle search text change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchText('');
  };

  // Toggle column visibility
  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns((prev: string[]) => {
      if (prev.includes(columnId)) {
        return prev.filter((id: string) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  // Open column menu
  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchorEl(event.currentTarget);
  };

  // Close column menu
  const handleCloseColumnMenu = () => {
    setColumnMenuAnchorEl(null);
  };

  // Open row action menu
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation();
    setActionMenuAnchorEl({ el: event.currentTarget, row });
  };

  // Close row action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  // Export data to CSV
  const handleExportData = () => {
    const headers = columns
      .filter(column => visibleColumns.includes(column.id))
      .map(column => column.label);
    
    const keys = columns
      .filter(column => visibleColumns.includes(column.id))
      .map(column => column.id);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    displayData.forEach((row: T) => {
      const rowValues = keys.map(key => {
        const value = row[key];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      });
      csvContent += rowValues.join(',') + '\n';
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title ? title.replace(/\s+/g, '_').toLowerCase() : 'data'}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if a row is selected
  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Get visible columns
  const visibleColumnsData = useMemo(() => 
    columns.filter(column => visibleColumns.includes(column.id)),
    [columns, visibleColumns]
  );

  // Toolbar component
  const TableToolbar = () => (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selected.length > 0 && {
          bgcolor: (theme: any) =>
            alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.2),
        }),
      }}
    >
      {selected.length > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {selected.length} selected
        </Typography>
      ) : (
        <Box sx={{ flex: '1 1 100%' }}>
          {title && (
            <Typography variant="h6" id="tableTitle" component="div">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {selected.length > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchText ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="large">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Export">
            <IconButton onClick={handleExportData} size="large">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Column visibility">
            <IconButton
              aria-label="column visibility"
              onClick={handleOpenColumnMenu}
              size="large"
            >
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>

          {actions}
        </Box>
      )}
      
      <Menu
        anchorEl={columnMenuAnchorEl}
        open={Boolean(columnMenuAnchorEl)}
        onClose={handleCloseColumnMenu}
      >
        {columns.map(column => (
          <MenuItem key={column.id} dense>
            <Checkbox
              checked={visibleColumns.includes(column.id)}
              onChange={() => handleToggleColumn(column.id)}
              size="small"
            />
            <Typography variant="body2">{column.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Toolbar>
  );

  // Render the empty state
  const renderEmptyState = () => {
    if (loading) return null;
    if (error) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            height: 200,
          }}
        >
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          {onRefresh && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              Retry
            </Button>
          )}
        </Box>
      );
    }
    
    if (paginatedData.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            height: 200,
          }}
        >
          {emptyContent || (
            <>
              <Typography variant="body1" gutterBottom>
                No data to display
              </Typography>
              {searchText && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleClearSearch}
                  startIcon={<ClearIcon />}
                >
                  Clear search
                </Button>
              )}
            </>
          )}
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', height: typeof height === 'number' ? height : 'auto' }}>
      <TableToolbar />
      
      {loading && <LinearProgress />}
      
      <TableContainer 
        ref={tableContainerRef}
        sx={{ 
          maxHeight: typeof height === 'number' ? height - 120 : 'calc(100% - 120px)',
          overflow: 'auto',
        }}
      >
        <Table stickyHeader aria-label={title || 'data table'} size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                    checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
              )}
              
              {visibleColumnsData.map((column: ColumnType<T>) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ 
                    minWidth: column.minWidth, 
                    width: column.width,
                    padding: column.disablePadding ? '0px 16px' : undefined,
                  }}
                  sortDirection={sortConfig?.key === column.id ? sortConfig.direction : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortConfig?.key === column.id}
                      direction={sortConfig?.key === column.id ? sortConfig.direction : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      IconComponent={sortConfig?.key === column.id ? ArrowDownwardIcon : undefined}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                  
                  {column.filterable && (
                    <Tooltip title="Filter">
                      <IconButton
                        size="small"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        sx={{ ml: 1 }}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              ))}
              
              <TableCell padding="checkbox" align="right" sx={{ width: 50 }}>
                {/* Actions column */}
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {renderEmptyState()}
            
            {loading && paginatedData.length === 0 && (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={20} height={20} />
                    </TableCell>
                  )}
                  
                  {visibleColumnsData.map((column: ColumnType<T>, colIndex: number) => (
                    <TableCell key={`skeleton-cell-${colIndex}`}>
                      <Skeleton variant="text" width={colIndex % 2 === 0 ? '70%' : '40%'} />
                    </TableCell>
                  ))}
                  
                  <TableCell padding="checkbox" align="right">
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                </TableRow>
              ))
            )}
            
            {!loading && paginatedData.length > 0 && (
              !virtualScroll ? (
                paginatedData.map((row: T) => {
                  const isItemSelected = isSelected(String(row[rowKey]));
                  const isRowEditing = editingRow === String(row[rowKey]);
                  
                  return (
                    <TableRow
                      key={String(row[rowKey])}
                      hover
                      onClick={(event: React.MouseEvent) => handleRowClick(event, row)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                      sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event: React.MouseEvent) => handleCheckboxClick(event, String(row[rowKey]))}
                          />
                        </TableCell>
                      )}
                      
                      {visibleColumnsData.map((column: ColumnType<T>) => (
                        <TableCell 
                          key={column.id} 
                          align={column.align || 'left'}
                          padding={column.disablePadding ? 'none' : 'normal'}
                        >
                          {isRowEditing && column.renderEditCell ? (
                            column.renderEditCell(row, handleSaveRow)
                          ) : column.renderCell ? (
                            column.renderCell(row)
                          ) : column.format ? (
                            column.format(row[column.id])
                          ) : (
                            row[column.id]
                          )}
                        </TableCell>
                      ))}
                      
                      <TableCell padding="checkbox" align="right">
                        <IconButton
                          size="small"
                          onClick={(event: React.MouseEvent) => handleOpenActionMenu(event, row)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableVirtuoso
                  data={paginatedData}
                  totalCount={paginatedData.length}
                  fixedHeaderContent={() => null} // Header is already handled by MUI Table
                  itemContent={(index: number, row: T) => {
                    const isItemSelected = isSelected(String(row[rowKey]));
                    const isRowEditing = editingRow === String(row[rowKey]);
                    
                    return (
                      <>
                        {selectable && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onClick={(event: React.MouseEvent) => handleCheckboxClick(event, String(row[rowKey]))}
                            />
                          </TableCell>
                        )}
                        
                        {visibleColumnsData.map((column: ColumnType<T>) => (
                          <TableCell 
                            key={column.id} 
                            align={column.align || 'left'}
                            padding={column.disablePadding ? 'none' : 'normal'}
                            onClick={(event: React.MouseEvent) => handleRowClick(event, row)}
                            sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                          >
                            {isRowEditing && column.renderEditCell ? (
                              column.renderEditCell(row, handleSaveRow)
                            ) : column.renderCell ? (
                              column.renderCell(row)
                            ) : column.format ? (
                              column.format(row[column.id])
                            ) : (
                              row[column.id]
                            )}
                          </TableCell>
                        ))}
                        
                        <TableCell padding="checkbox" align="right">
                          <IconButton
                            size="small"
                            onClick={(event: React.MouseEvent) => handleOpenActionMenu(event, row)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    );
                  }}
                  components={{
                    Table: (props: any) => <Table {...props} stickyHeader aria-label={title || 'data table'} size="small" />,
                    TableRow: (props: any) => {
                      const { item, ...rest } = props as any;
                      const row = item;
                      const isItemSelected = row ? isSelected(String(row[rowKey])) : false;
                      
                      return (
                        <TableRow
                          {...rest}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          selected={isItemSelected}
                        />
                      );
                    },
                    TableBody: React.forwardRef((props: any, ref: any) => <TableBody {...props} ref={ref} />),
                  }}
                />
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={displayData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      
      <Menu
        anchorEl={actionMenuAnchorEl?.el}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        {onRowEdit && (
          <MenuItem
            onClick={() => {
              if (actionMenuAnchorEl?.row) {
                handleRowEdit(actionMenuAnchorEl.row);
                handleCloseActionMenu();
              }
            }}
            dense
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        
        <MenuItem
          onClick={() => {
            // Copy row to clipboard as JSON
            if (actionMenuAnchorEl?.row) {
              navigator.clipboard.writeText(JSON.stringify(actionMenuAnchorEl.row, null, 2));
              handleCloseActionMenu();
            }
          }}
          dense
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Copy
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={handleCloseActionMenu}
          dense
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default DataTable;