import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  CalendarMonth,
  Assignment,
  Inventory2,
  Receipt,
  People,
  BarChart,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7,
  Build,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const DRAWER_WIDTH = 260;

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: <Dashboard />, roles: ['ADMIN', 'OWNER', 'MECHANIC', 'RECEPTIONIST', 'ACCOUNTANT', 'INVENTORY_MANAGER'] },
  { path: '/bookings', label: 'الحجوزات', icon: <CalendarMonth />, roles: ['ADMIN', 'OWNER', 'MECHANIC', 'RECEPTIONIST'] },
  { path: '/job-cards', label: 'بطاقات العمل', icon: <Assignment />, roles: ['ADMIN', 'OWNER', 'MECHANIC', 'RECEPTIONIST'] },
  { path: '/inventory', label: 'المخزون', icon: <Inventory2 />, roles: ['ADMIN', 'OWNER', 'INVENTORY_MANAGER'] },
  { path: '/invoices', label: 'الفواتير', icon: <Receipt />, roles: ['ADMIN', 'OWNER', 'RECEPTIONIST', 'ACCOUNTANT'] },
  { path: '/customers', label: 'العملاء', icon: <People />, roles: ['ADMIN', 'OWNER', 'RECEPTIONIST'] },
  { path: '/reports', label: 'التقارير', icon: <BarChart />, roles: ['ADMIN', 'OWNER', 'ACCOUNTANT'] },
  { path: '/settings', label: 'الإعدادات', icon: <Settings />, roles: ['ADMIN', 'OWNER'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout() as any);
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    item => !user?.role || item.roles.includes(user.role)
  );

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'مدير النظام',
      OWNER: 'مالك الورشة',
      MECHANIC: 'ميكانيكي',
      RECEPTIONIST: 'موظف استقبال',
      ACCOUNTANT: 'محاسب',
      INVENTORY_MANAGER: 'مدير المخزون',
      CUSTOMER: 'عميل',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default' => {
    const colors: Record<string, 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default'> = {
      ADMIN: 'error',
      OWNER: 'primary',
      MECHANIC: 'success',
      RECEPTIONIST: 'info',
      ACCOUNTANT: 'warning',
      INVENTORY_MANAGER: 'secondary',
    };
    return colors[role] || 'default';
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          mr: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: 'width 0.3s, margin 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 2 }}
          >
            {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Build sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            {user?.garage?.name || 'Garage Go'}
          </Typography>

          {/* Notifications */}
          <Tooltip title="الإشعارات">
            <IconButton color="inherit" onClick={handleNotifMenuOpen}>
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Tooltip title={user?.fullName || 'الحساب'}>
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}
              >
                {user?.fullName?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={sidebarOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        {/* User Info in Sidebar */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={user?.avatar} sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}>
            {user?.fullName?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {user?.fullName}
            </Typography>
            <Chip
              label={getRoleLabel(user?.role || '')}
              size="small"
              color={getRoleColor(user?.role || '')}
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <List sx={{ pt: 1 }}>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          transition: 'width 0.3s',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings/profile'); }}>
          <AccountCircle sx={{ mr: 1 }} /> الملف الشخصي
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
          <Settings sx={{ mr: 1 }} /> الإعدادات
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 1 }} /> تسجيل الخروج
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 320 } }}
      >
        <MenuItem>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>الإشعارات</Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>حجز جديد</Typography>
            <Typography variant="caption" color="text.secondary">منذ 5 دقائق</Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>بطاقة عمل مكتملة</Typography>
            <Typography variant="caption" color="text.secondary">منذ 20 دقيقة</Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>فاتورة جديدة</Typography>
            <Typography variant="caption" color="text.secondary">منذ ساعة</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};
