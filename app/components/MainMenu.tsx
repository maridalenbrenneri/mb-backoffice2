import React from 'react';
import { Link } from '@remix-run/react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Divider, Drawer, List, ListItem, ListItemText } from '@mui/material';

export default function MainMenu() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MB Backoffice
          </Typography>

          <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <List>
              <ListItem
                button
                component={Link}
                to={'/'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Dashboard" />
              </ListItem>

              <Divider />

              <ListItem
                button
                component={Link}
                to={'/orders'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Orders" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to={'/subscriptions'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Subscriptions" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to={'/coffees'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Coffees" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to={'/deliveries'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Deliveries" />
              </ListItem>

              <Divider />

              <ListItem
                button
                component={Link}
                to={'/b2b'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Fiken Customers" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to={'/woo-import-result'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Woo Import Data" />
              </ListItem>
            </List>
          </Drawer>

          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
