import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react';

import { Box } from '@mui/material';

import MainMenu from './components/MainMenu';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'MB Backoffice',
  viewport: 'width=device-width,initial-scale=1',
});

function Document({ children }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <MainMenu />
      <Box m={2}>
        <Outlet />
      </Box>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  switch (caught.status) {
    case 401:
    case 404:
      return (
        <Document title={`${caught.status} ${caught.statusText}`}>
          <div style={{ margin: '50px auto', textAlign: 'center' }}>
            <h1>
              {caught.status} {caught.statusText}
            </h1>
            <p>
              The page you are looking for was not found. Go to
              <a href="/"> fronpage</a>.
            </p>
          </div>
        </Document>
      );

    default:
      throw new Error(
        `Unexpected caught response with status: ${caught.status}`
      );
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
