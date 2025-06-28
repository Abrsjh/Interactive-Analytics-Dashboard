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
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Menu,
  Divider,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  format,
  parseISO,
  subDays,
  subMonths,
  isAfter,
  isBefore,
} from 'date-fns';
import { useGlobalState } from '../context/GlobalStateContext';

// Types
interface Transaction {
  id: string;
  date: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    category: string;
  };
  payment: {
    method: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
  };
  shipment: {
    status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
    address: string;
  };
}

type OrderDirection = 'asc' | 'desc';

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
  sortable: boolean;
  width?: string;
}

// Mock data generator
const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Crypto'];
  const paymentStatuses: Array<'completed' | 'pending' | 'failed'> = ['completed', 'pending', 'failed'];
  const shipmentStatuses: Array<'delivered' | 'shipped' | 'processing' | 'cancelled'> = [
    'delivered',
    'shipped',
    'processing',
    'cancelled',
  ];
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Books',
    'Beauty & Personal Care',
  ];
  const products = [
    'Smartphone Pro X',
    'Wireless Headphones',
    'Smart Watch',
    'Designer T-Shirt',
    'Jeans Premium',
    'Coffee Maker',
    'Smart Home Hub',
    'Robot Vacuum',
    'Bestseller Novel',
    'Data Science Book',
    'Skincare Set',
    'Makeup Kit',
  ];

  const now = new Date();
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const amount = Math.floor(Math.random() * 900) + 100; // $100 to $999
    const days = Math.floor(Math.random() * 90); // Last 90 days
    const date = subDays(now, days);
    
    transactions.push({
      id: `TRX-${100000 + i}`,
      date: format(date, 'yyyy-MM-dd'),
      customer: {
        id: `CUST-${10000 + i}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      },
      product: {
        id: `PROD-${1000 + i % 12}`,
        name: product,
        category: category,
      },
      payment: {
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        amount: amount,
        status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      },
      shipment: {
        status: shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)],
        address: `${Math.floor(Math.random() * 1000) + 1} Main St, City, State, 12345`,
      },
    });
  }

  return transactions;
};

// Table headers
const headCells: HeadCell[] = [
  { id: 'id', label: 'Transaction ID', numeric: false, sortable: true },
  { id: 'date', label: 'Date', numeric: false, sortable: true },
  { id: 'customer', label: 'Customer', numeric: false, sortable: true },
  { id: 'product', label: 'Product', numeric: false, sortable: true },
  { id: 'amount', label: 'Amount', numeric: true, sortable: true },
  { id: 'paymentStatus', label: 'Payment Status', numeric: false, sortable: true },
  { id: 'shipmentStatus', label: 'Shipment Status', numeric: false, sortable: true },
  { id: 'actions', label: 'Actions', numeric: false, sortable: false, width: '100px' },
];

// Component
const Transactions: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string[]>([]);
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('date');
  const [order, setOrder] = useState<OrderDirection>('desc');
  const [selected, setSelected] = useState<string[]>([]);

  // Action menu
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Generate mock data
        const mockData = generateMockTransactions(100);
        setTransactions(mockData);
        
        // Update last updated timestamp
        dispatch({ type: 'UPDATE_LAST_UPDATED' });
      } catch (error) {
        console.error('Error loading transaction data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load transaction data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date filter
      const transactionDate = parseISO(transaction.date);
      const dateInRange = (!startDate || isAfter(transactionDate, startDate)) && 
                        (!endDate || isBefore(transactionDate, endDate));
      
      // Status filters
      const matchesPaymentStatus = paymentStatusFilter.length === 0 || 
                                 paymentStatusFilter.includes(transaction.payment.status);
      
      const matchesShipmentStatus = shipmentStatusFilter.length === 0 || 
                                  shipmentStatusFilter.includes(transaction.shipment.status);
      
      // Category filter
      const matchesCategory = categoryFilter.length === 0 || 
                            categoryFilter.includes(transaction.product.category);
      
      // Search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
                          transaction.id.toLowerCase().includes(searchLower) ||
                          transaction.customer.name.toLowerCase().includes(searchLower) ||
                          transaction.customer.email.toLowerCase().includes(searchLower) ||
                          transaction.product.name.toLowerCase().includes(searchLower);
      
      return dateInRange && matchesPaymentStatus && matchesShipmentStatus && matchesCategory && matchesSearch;
    });
  }, [
    transactions, 
    startDate, 
    endDate, 
    paymentStatusFilter, 
    shipmentStatusFilter, 
    categoryFilter, 
    searchQuery
  ]);

  // Sorting logic
  const sortedTransactions = useMemo(() => {
    const compare = (a: Transaction, b: Transaction) => {
      let valueA;
      let valueB;

      switch (orderBy) {
        case 'date':
          valueA = parseISO(a.date).getTime();
          valueB = parseISO(b.date).getTime();
          break;
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'customer':
          valueA = a.customer.name;
          valueB = b.customer.name;
          break;
        case 'product':
          valueA = a.product.name;
          valueB = b.product.name;
          break;
        case 'amount':
          valueA = a.payment.amount;
          valueB = b.payment.amount;
          break;
        case 'paymentStatus':
          valueA = a.payment.status;
          valueB = b.payment.status;
          break;
        case 'shipmentStatus':
          valueA = a.shipment.status;
          valueB = b.shipment.status;
          break;
        default:
          valueA = a.id;
          valueB = b.id;
      }

      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    };

    return [...filteredTransactions].sort(compare);
  }, [filteredTransactions, order, orderBy]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedTransactions, page, rowsPerPage]);

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    transactions.forEach(transaction => {
      categories.add(transaction.product.category);
    });
    return Array.from(categories).sort();
  }, [transactions]);

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  // Handle payment status filter
  const handlePaymentStatusChange = (event: SelectChangeEvent<typeof paymentStatusFilter>) => {
    const {
      target: { value },
    } = event;
    setPaymentStatusFilter(typeof value === 'string' ? value.split(',') : value);
    setPage(0);
  };

  // Handle shipment status filter
  const handleShipmentStatusChange = (event: SelectChangeEvent<typeof shipmentStatusFilter>) => {
    const {
      target: { value },
    } = event;
    setShipmentStatusFilter(typeof value === 'string' ? value.split(',') : value);
    setPage(0);
  };

  // Handle category filter
  const handleCategoryChange = (event: SelectChangeEvent<typeof categoryFilter>) => {
    const {
      target: { value },
    } = event;
    setCategoryFilter(typeof value === 'string' ? value.split(',') : value);
    setPage(0);
  };

  // Handle date change
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setPage(0);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setPage(0);
  };

  // Handle sorting
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle row selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedTransactions.map(transaction => transaction.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (_event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setActionMenuAnchorEl(event.currentTarget);
    setCurrentTransaction(transaction);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setCurrentTransaction(null);
  };

  // Handle delete
  const handleDeleteClick = () => {
    handleActionMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // In a real app, this would send a delete request to the API
    if (currentTransaction) {
      setTransactions(transactions.filter(t => t.id !== currentTransaction.id));
      setSelected(selected.filter(id => id !== currentTransaction.id));
    }
    setDeleteDialogOpen(false);
    setCurrentTransaction(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCurrentTransaction(null);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    // In a real app, this would send a delete request to the API
    setTransactions(transactions.filter(t => !selected.includes(t.id)));
    setSelected([]);
  };

  // Handle export
  const handleExport = () => {
    // In a real app, this would generate and download a CSV file
    alert('Exporting transactions to CSV...');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Render status chip
  const renderPaymentStatusChip = (status: 'completed' | 'pending' | 'failed') => {
    let color: 'success' | 'warning' | 'error' = 'success';
    let icon = <CheckCircleIcon fontSize="small" />;

    switch (status) {
      case 'pending':
        color = 'warning';
        icon = <WarningIcon fontSize="small" />;
        break;
      case 'failed':
        color = 'error';
        icon = <CancelIcon fontSize="small" />;
        break;
    }

    return (
      <Chip
        icon={icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  const renderShipmentStatusChip = (status: 'delivered' | 'shipped' | 'processing' | 'cancelled') => {
    let color: 'success' | 'primary' | 'warning' | 'error' = 'success';
    
    switch (status) {
      case 'shipped':
        color = 'primary';
        break;
      case 'processing':
        color = 'warning';
        break;
      case 'cancelled':
        color = 'error';
        break;
    }

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={color}
        size="small"
        variant="outlined"
      />
    );
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
          Transactions
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}>
          {selected.length > 0 ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              size="small"
            >
              Delete ({selected.length})
            </Button>
          ) : (
            <>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={() => setIsLoading(true)}
                disabled={isLoading}
                size="small"
              >
                Refresh
              </Button>
              
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={handleExport}
                size="small"
              >
                Export
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      {/* Filters */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          gap: 2
        }}
        elevation={1}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Filters</Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          flexWrap: 'wrap',
          gap: 2,
          width: { xs: '100%', md: 'auto' } 
        }}>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          
          <FormControl sx={{ width: { xs: '100%', sm: 200 } }} size="small">
            <InputLabel id="payment-status-label">Payment Status</InputLabel>
            <Select
              labelId="payment-status-label"
              multiple
              value={paymentStatusFilter}
              onChange={handlePaymentStatusChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Payment Status"
            >
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ width: { xs: '100%', sm: 200 } }} size="small">
            <InputLabel id="shipment-status-label">Shipment Status</InputLabel>
            <Select
              labelId="shipment-status-label"
              multiple
              value={shipmentStatusFilter}
              onChange={handleShipmentStatusChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Shipment Status"
            >
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ width: { xs: '100%', sm: 200 } }} size="small">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              multiple
              value={categoryFilter}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Category"
            >
              {uniqueCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <DatePicker
                label="From Date"
                value={startDate}
                onChange={handleStartDateChange}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={handleEndDateChange}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </LocalizationProvider>
        </Box>
      </Paper>
      
      {/* Transactions Table */}
      <Card elevation={1}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">Transaction List</Typography>
              <Chip 
                label={`${filteredTransactions.length} records`} 
                size="small" 
                sx={{ ml: 2 }} 
              />
            </Box>
          }
          action={
            <Tooltip title="This table shows all transactions with filtering and sorting capabilities">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {Array.from(new Array(5)).map((_, index) => (
                  <Grid item xs={12} key={index}>
                    <Skeleton variant="rectangular" height={40} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < paginatedTransactions.length}
                          checked={paginatedTransactions.length > 0 && selected.length === paginatedTransactions.length}
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      {headCells.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          align={headCell.numeric ? 'right' : 'left'}
                          sortDirection={orderBy === headCell.id ? order : false}
                          sx={headCell.width ? { width: headCell.width } : {}}
                        >
                          {headCell.sortable ? (
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={orderBy === headCell.id ? order : 'asc'}
                              onClick={() => handleRequestSort(headCell.id)}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          ) : (
                            headCell.label
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No transactions found matching your criteria
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((transaction) => {
                        const isItemSelected = isSelected(transaction.id);
                        
                        return (
                          <TableRow
                            hover
                            key={transaction.id}
                            selected={isItemSelected}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              cursor: 'pointer',
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onClick={(event) => handleSelectClick(event, transaction.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" component="span">
                                {transaction.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" component="span">
                                {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" component="span">
                                {transaction.customer.name}
                              </Typography>
                              <Typography variant="caption" component="div" color="text.secondary">
                                {transaction.customer.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" component="span">
                                {transaction.product.name}
                              </Typography>
                              <Typography variant="caption" component="div" color="text.secondary">
                                {transaction.product.category}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" component="span" fontWeight={500}>
                                {formatCurrency(transaction.payment.amount)}
                              </Typography>
                              <Typography variant="caption" component="div" color="text.secondary">
                                {transaction.payment.method}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {renderPaymentStatusChip(transaction.payment.status)}
                            </TableCell>
                            <TableCell>
                              {renderShipmentStatusChip(transaction.shipment.status)}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(event) => handleActionMenuOpen(event, transaction)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleActionMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Transaction
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete transaction {currentTransaction?.id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;