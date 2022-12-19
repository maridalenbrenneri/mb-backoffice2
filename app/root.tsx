import type { MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from '@remix-run/react';

import { Box, ThemeProvider, CssBaseline, Typography } from '@mui/material';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import MainMenu from './components/MainMenu';
import { theme } from './style/theme';
import { requireUserId } from './utils/session.server';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'MB Backoffice',
  viewport: 'width=device-width,initial-scale=1',
});

type LoaderData = {
  userId: string | null;
};

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.pathname === '/login')
    return json<LoaderData>({
      userId: null,
    });

  const userId = await requireUserId(request);

  return json<LoaderData>({
    userId,
  });
};

function Document({ children }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <CssBaseline />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  const { userId } = useLoaderData() as unknown as LoaderData;

  return (
    <ThemeProvider theme={theme}>
      <Document>
        <MainMenu loggedIn={!!userId} />
        <Box m={2}>
          <Outlet />
        </Box>
      </Document>
    </ThemeProvider>
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
              <a href="/"> frontpage</a>.
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
        <Typography variant="h4">App Error</Typography>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
