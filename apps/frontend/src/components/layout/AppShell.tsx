'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  Handshake as HandshakeIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const SIDEBAR_OPEN_KEY = 'appShell-sidebarOpen';
const DRAWER_WIDTH_OPEN = 260;
const DRAWER_WIDTH_CLOSED = 72;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'ראשי',
    items: [{ label: 'לוח בקרה', href: '/dashboard', icon: <DashboardIcon /> }],
  },
  {
    label: 'נכסים',
    items: [
      { label: 'נכסים', href: '/properties', icon: <ApartmentIcon /> },
      { label: 'בעלות', href: '/ownerships', icon: <HandshakeIcon /> },
    ],
  },
  {
    label: 'אנשים',
    items: [
      { label: 'בעלים', href: '/owners', icon: <PersonIcon /> },
      { label: 'אנשים', href: '/persons', icon: <GroupIcon /> },
    ],
  },
  {
    label: 'פיננסים',
    items: [
      { label: 'משכנתאות', href: '/mortgages', icon: <AccountBalanceIcon /> },
      { label: 'חשבונות בנק', href: '/bank-accounts', icon: <AccountBalanceWalletIcon /> },
      { label: 'חוזי שכירות', href: '/leases', icon: <DescriptionIcon /> },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load sidebar state from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_OPEN_KEY);
      setSidebarOpenState(saved !== 'false');
    }
  }, []);

  const setSidebarOpen = (open: boolean) => {
    setSidebarOpenState(open);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(open));
    }
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const drawerContent = (
    <Box
      sx={{
        width: isMobile ? DRAWER_WIDTH_OPEN : sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {NAV_GROUPS.map((group) => (
          <Box key={group.label} sx={{ mb: 2 }}>
            {sidebarOpen && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {group.label}
              </Typography>
            )}
            <List disablePadding>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const listItem = (
                  <ListItem key={item.href} disablePadding sx={{ px: 1 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={handleNavClick}
                      selected={active}
                      sx={{
                        borderRadius: 1,
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        px: sidebarOpen ? 2 : 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'primary.contrastText',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: sidebarOpen ? 40 : 0,
                          mr: sidebarOpen ? 2 : 0,
                          color: active ? 'inherit' : 'action.active',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {sidebarOpen && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: active ? 600 : 400,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
                return sidebarOpen ? (
                  listItem
                ) : (
                  <Tooltip key={item.href} title={item.label} placement="left">
                    {listItem}
                  </Tooltip>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: '100%',
            md: `calc(100% - ${sidebarOpen && !isMobile ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED}px)`,
          },
          mr: {
            xs: 0,
            md: sidebarOpen && !isMobile ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="תפריט"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <HomeIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1 }}>
            מערכת ניהול נכסים
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar - Desktop: permanent drawer on RIGHT (RTL) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          anchor="right"
          open
          sx={{
            '& .MuiDrawer-paper': {
              position: 'relative',
              width: sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
              borderLeft: 'none',
              borderRight: 1,
              borderColor: 'divider',
              mt: '64px',
              height: 'calc(100vh - 64px)',
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Sidebar - Mobile: temporary overlay drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH_OPEN,
              boxSizing: 'border-box',
              mt: '64px',
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppShell;
