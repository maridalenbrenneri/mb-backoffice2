import React from 'react';
import { Form, Link } from '@remix-run/react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Divider, Drawer, List, ListItem, ListItemText } from '@mui/material';

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
                to={'/packing'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Packing" />
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
                <ListItemText primary="Fiken customers" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to={'/scheduled-jobs'}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary="Scheduled jobs" />
              </ListItem>
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
