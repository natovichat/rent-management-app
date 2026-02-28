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
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  Handshake as HandshakeIcon,
  Group as GroupIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Description as DescriptionIcon,
  Tag as TagIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';

const SIDEBAR_OPEN_KEY = 'appShell-sidebarOpen';
const DRAWER_WIDTH_OPEN = 260;
const DRAWER_WIDTH_CLOSED = 72;

const BOTTOM_NAV_ITEMS = [
  { label: 'לוח בקרה', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'נכסים', href: '/properties', icon: <ApartmentIcon /> },
  { label: 'חוזים', href: '/leases', icon: <DescriptionIcon /> },
  { label: 'משכנתאות', href: '/mortgages', icon: <AccountBalanceIcon /> },
  { label: 'אנשים', href: '/persons', icon: <GroupIcon /> },
] as const;

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

function getBottomNavValue(pathname: string): string {
  if (pathname === '/dashboard') return '/dashboard';
  if (pathname.startsWith('/properties')) return '/properties';
  if (pathname.startsWith('/leases')) return '/leases';
  if (pathname.startsWith('/mortgages')) return '/mortgages';
  if (pathname.startsWith('/persons')) return '/persons';
  return '';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarOpen, setSidebarOpenState] = useState(true);

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
    setSidebarOpen(!sidebarOpen);
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
        width: sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
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
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1 }}>
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
        {/* Version badge at bottom of sidebar */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: 1,
          }}
        >
          {sidebarOpen ? (
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
            >
              גרסה {APP_VERSION}
            </Typography>
          ) : (
            <Tooltip title={`גרסה ${APP_VERSION}`} placement="left">
              <TagIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </Tooltip>
          )}
        </Box>
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
            md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED}px)`,
          },
          mr: {
            xs: 0,
            md: sidebarOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          {/* Hamburger - desktop only (no drawer on mobile) */}
          <IconButton
            color="inherit"
            aria-label="תפריט"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { xs: 'none', md: 'flex' } }}
          >
            <MenuIcon />
          </IconButton>
          <HomeIcon sx={{ mr: 1.5 }} />
          <Typography
            variant="h6"
            component="h1"
            noWrap
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            מערכת ניהול נכסים
          </Typography>
          {/* Version badge - hidden on mobile */}
          <Tooltip title={`גרסה ${APP_VERSION}`}>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.15)',
                cursor: 'default',
              }}
            >
              <TagIcon sx={{ fontSize: 14, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                {APP_VERSION}
              </Typography>
            </Box>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar - Desktop only (no mobile drawer) */}
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

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflowX: 'hidden',
          p: { xs: 1.5, sm: 2, md: 3 },
          pb: { xs: '72px', md: 0 },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <BottomNavigation
          value={getBottomNavValue(pathname)}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            zIndex: theme.zIndex.appBar,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {BOTTOM_NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.href}
              component={Link}
              href={item.href}
              value={item.href}
              label={item.label}
              icon={item.icon}
              sx={{
                minWidth: 0,
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                },
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}

export default AppShell;
