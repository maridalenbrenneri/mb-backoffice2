import React from 'react';
import { Link } from '@remix-run/react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';

export default function MbAppBar() {
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
              <ListItem button component={Link} to={'/'}>
                <ListItemText primary="Dashboard" />
              </ListItem>

              <ListItem button component={Link} to={'/subscriptions'}>
                <ListItemText primary="Subscriptions" />
              </ListItem>

              <ListItem button component={Link} to={'/coffees'}>
                <ListItemText primary="Coffees" />
              </ListItem>

              <ListItem button component={Link} to={'/deliveries'}>
                <ListItemText primary="Deliveries" />
              </ListItem>

              <ListItem button component={Link} to={'/woo-import-result'}>
                <ListItemText primary="Woo Import" />
              </ListItem>
            </List>
          </Drawer>

          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
