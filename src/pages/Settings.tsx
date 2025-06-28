import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Slider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useGlobalState } from '../context/GlobalStateContext';
import { useThemeMode } from '../styles/theme';

// Types
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

// Main Component
const Settings: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useGlobalState();
  const { mode, toggleColorMode } = useThemeMode();
  const [tabValue, setTabValue] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(state.refreshInterval / 60000); // Convert to minutes
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // User preferences
  const [showTooltips, setShowTooltips] = useState(state.userPreferences.showTooltips);
  const [autoRefresh, setAutoRefresh] = useState(state.userPreferences.autoRefresh);
  const [defaultView, setDefaultView] = useState(state.userPreferences.defaultView);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notifyOnAnomalies, setNotifyOnAnomalies] = useState(true);
  const [notifyOnReports, setNotifyOnReports] = useState(true);
  
  // Data settings
  const [dataCache, setDataCache] = useState(true);
  const [dataExportFormat, setDataExportFormat] = useState('csv');
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState(90); // days

  // Effects to sync with global state
  useEffect(() => {
    setRefreshInterval(state.refreshInterval / 60000);
    setShowTooltips(state.userPreferences.showTooltips);
    setAutoRefresh(state.userPreferences.autoRefresh);
    setDefaultView(state.userPreferences.defaultView);
  }, [state.refreshInterval, state.userPreferences]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh interval change
  const handleRefreshIntervalChange = (_event: Event, newValue: number | number[]) => {
    setRefreshInterval(newValue as number);
  };

  // Handle default view change
  const handleDefaultViewChange = (event: SelectChangeEvent) => {
    setDefaultView(event.target.value);
  };
  
  // Handle data export format change
  const handleDataExportFormatChange = (event: SelectChangeEvent) => {
    setDataExportFormat(event.target.value);
  };
  
  // Handle data retention period change
  const handleDataRetentionPeriodChange = (_event: Event, newValue: number | number[]) => {
    setDataRetentionPeriod(newValue as number);
  };

  // Save settings
  const handleSaveSettings = () => {
    // Update global state
    dispatch({
      type: 'SET_REFRESH_INTERVAL',
      payload: refreshInterval * 60000, // Convert back to milliseconds
    });
    
    dispatch({
      type: 'UPDATE_USER_PREFERENCE',
      payload: { key: 'showTooltips', value: showTooltips },
    });
    
    dispatch({
      type: 'UPDATE_USER_PREFERENCE',
      payload: { key: 'autoRefresh', value: autoRefresh },
    });
    
    dispatch({
      type: 'UPDATE_USER_PREFERENCE',
      payload: { key: 'defaultView', value: defaultView },
    });
    
    // Show success message
    setSnackbarMessage('Settings saved successfully');
    setSnackbarOpen(true);
  };

  // Reset settings to defaults
  const handleResetSettings = () => {
    setRefreshInterval(5); // 5 minutes
    setShowTooltips(true);
    setAutoRefresh(true);
    setDefaultView('sales');
    setEmailNotifications(true);
    setPushNotifications(true);
    setNotifyOnAnomalies(true);
    setNotifyOnReports(true);
    setDataCache(true);
    setDataExportFormat('csv');
    setDataRetentionPeriod(90);
    
    // Show success message
    setSnackbarMessage('Settings reset to defaults');
    setSnackbarOpen(true);
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
          Settings
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<PaletteIcon />} iconPosition="start" label="Appearance" />
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
            <Tab icon={<DataUsageIcon />} iconPosition="start" label="Data & Privacy" />
          </Tabs>
        </Box>
        
        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={0}>
          <Card elevation={1}>
            <CardHeader 
              title="Theme Settings" 
              avatar={<PaletteIcon />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Color Theme</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={mode === 'dark'}
                            onChange={() => {
                              toggleColorMode();
                            }}
                            color="primary"
                          />
                        }
                        label="Dark Mode"
                      />
                    </FormGroup>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Switch between light and dark themes. Dark theme reduces eye strain in low-light environments.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Font Size</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="font-size-label">Font Size</InputLabel>
                      <Select
                        labelId="font-size-label"
                        value="medium"
                        label="Font Size"
                      >
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary">
                      Adjust the font size across the application for better readability.
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Chart Colors</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.primary.main,
                              mr: 2
                            }} 
                          />
                          <Typography>Primary Series</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.secondary.main,
                              mr: 2
                            }} 
                          />
                          <Typography>Secondary Series</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.success.main,
                              mr: 2
                            }} 
                          />
                          <Typography>Positive Values</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.error.main,
                              mr: 2
                            }} 
                          />
                          <Typography>Negative Values</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.warning.main,
                              mr: 2
                            }} 
                          />
                          <Typography>Warning States</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.info.main,
                              mr: 2
                            }} 
                          />
                          <Typography>Information</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                      Customize Chart Colors
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card elevation={1}>
            <CardHeader 
              title="Dashboard Settings" 
              avatar={<DashboardIcon />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>General Settings</Typography>
                    
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showTooltips}
                            onChange={(e) => setShowTooltips(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Show Tooltips"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Auto-refresh Data"
                      />
                    </FormGroup>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography id="refresh-interval-slider" gutterBottom>
                        Refresh Interval: {refreshInterval} minutes
                      </Typography>
                      <Slider
                        value={refreshInterval}
                        onChange={handleRefreshIntervalChange}
                        aria-labelledby="refresh-interval-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={60}
                        disabled={!autoRefresh}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Default View</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="default-view-label">Default Dashboard View</InputLabel>
                      <Select
                        labelId="default-view-label"
                        value={defaultView}
                        label="Default Dashboard View"
                        onChange={handleDefaultViewChange}
                      >
                        <MenuItem value="dashboard">Main Dashboard</MenuItem>
                        <MenuItem value="sales">Sales Analytics</MenuItem>
                        <MenuItem value="geography">Geographic Data</MenuItem>
                        <MenuItem value="transactions">Transactions</MenuItem>
                        <MenuItem value="predictions">Predictions</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary">
                      Select which view to display when you first open the application
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Widget Layout</Typography>
                    <Typography variant="body2" paragraph>
                      Customize your dashboard by dragging and rearranging widgets.
                    </Typography>
                    <Button variant="outlined">
                      Customize Dashboard Layout
                    </Button>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Your layout settings will be saved automatically and persisted across sessions.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card elevation={1}>
            <CardHeader 
              title="Notification Settings" 
              avatar={<NotificationsIcon />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Notification Channels</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Push Notifications" 
                          secondary="Receive alerts directly in your browser"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={pushNotifications}
                            onChange={(e) => setPushNotifications(e.target.checked)}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email Notifications" 
                          secondary="Receive alerts via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Notification Types</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Data Anomalies" 
                          secondary="Be notified when unusual patterns are detected"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notifyOnAnomalies}
                            onChange={(e) => setNotifyOnAnomalies(e.target.checked)}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Scheduled Reports" 
                          secondary="Receive regular reports based on your schedule"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notifyOnReports}
                            onChange={(e) => setNotifyOnReports(e.target.checked)}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Notification Schedule</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="report-frequency-label">Report Frequency</InputLabel>
                          <Select
                            labelId="report-frequency-label"
                            value="weekly"
                            label="Report Frequency"
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="quarterly">Quarterly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="report-day-label">Day of Week</InputLabel>
                          <Select
                            labelId="report-day-label"
                            value="monday"
                            label="Day of Week"
                          >
                            <MenuItem value="monday">Monday</MenuItem>
                            <MenuItem value="tuesday">Tuesday</MenuItem>
                            <MenuItem value="wednesday">Wednesday</MenuItem>
                            <MenuItem value="thursday">Thursday</MenuItem>
                            <MenuItem value="friday">Friday</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Reports will be delivered at 8:00 AM in your local timezone.
                    </Alert>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Data & Privacy Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card elevation={1}>
            <CardHeader 
              title="Data & Privacy Settings" 
              avatar={<DataUsageIcon />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Data Storage</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <StorageIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Cache Data Locally" 
                          secondary="Improves performance, but uses more storage"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={dataCache}
                            onChange={(e) => setDataCache(e.target.checked)}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography id="data-retention-slider" gutterBottom>
                        Data Retention Period: {dataRetentionPeriod} days
                      </Typography>
                      <Slider
                        value={dataRetentionPeriod}
                        onChange={handleDataRetentionPeriodChange}
                        aria-labelledby="data-retention-slider"
                        valueLabelDisplay="auto"
                        step={30}
                        marks
                        min={30}
                        max={365}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Data Export</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="export-format-label">Default Export Format</InputLabel>
                      <Select
                        labelId="export-format-label"
                        value={dataExportFormat}
                        label="Default Export Format"
                        onChange={handleDataExportFormatChange}
                      >
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<BackupIcon />}
                      sx={{ mt: 2 }}
                    >
                      Export All Dashboard Data
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Security & Privacy</Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Your data is stored securely and is not shared with third parties.
                    </Alert>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          startIcon={<SecurityIcon />}
                          fullWidth
                        >
                          Clear All Cached Data
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Button 
                          variant="outlined" 
                          startIcon={<BackupIcon />}
                          fullWidth
                        >
                          Backup Dashboard Configuration
                        </Button>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Last data backup: Never
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default Settings;