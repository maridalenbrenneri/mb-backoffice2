import React from 'react';
import { Form, Link } from '@remix-run/react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import CoffeeIcon from '@mui/icons-material/Coffee';

export default function MainMenu(props: { loggedIn: boolean }) {
  const { loggedIn } = props;

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {loggedIn && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MB Backoffice
          </Typography>

          <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <List
              sx={{
                '& .MuiTypography-root': {
                  m: 0.25,
                  marginLeft: 1,
                  minWidth: 250,
                },
              }}
            >
              <ListItemButton
                component={Link}
                to={'/'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <DashboardIcon />
                <ListItemText primary="Dashboard" />
              </ListItemButton>

              <Divider />

              <ListItemButton
                component={Link}
                to={'/packing'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <LocalPostOfficeIcon />
                <ListItemText primary="Packing & Shipping" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to={'/products'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <CoffeeIcon />
                <ListItemText primary="Products" />
              </ListItemButton>

              <Divider />

              <ListItemButton
                component={Link}
                to={'/subscriptions'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText secondary="Subscriptions" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to={'/orders'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText secondary="Orders" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to={'/deliveries'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText secondary="Delivery days" />
              </ListItemButton>

              <Divider />

              <ListItemButton
                component={Link}
                to={'/b2b'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText secondary="Fiken customers" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to={'/scheduled-jobs'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText secondary="Scheduled jobs" />
              </ListItemButton>

              <Divider />

              <ListItemButton
                component={Link}
                to={'/help'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText secondary="Help" />
              </ListItemButton>
            </List>
          </Drawer>
          {loggedIn && (
            <div>
              <Form action="/logout" method="post">
                <Button sx={{ color: '#000' }} type="submit">
                  Logout
                </Button>
              </Form>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
