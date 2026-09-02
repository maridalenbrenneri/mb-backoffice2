import type { MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
} from '@remix-run/react';

import {
  Box,
  ThemeProvider,
  CssBaseline,
  Typography,
  LinearProgress,
} from '@mui/material';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import MainMenu from './components/MainMenu';
import { DashboardFallback } from './components/DashboardFallback';
import { theme } from './style/theme';
import { requireUserId } from './utils/session.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'MB Backoffice' },
    {
      property: 'og:title',
      content: 'MB Backoffice',
    },
    {
      name: 'description',
      content: 'This app is the best',
    },
  ];
};

type LoaderData = {
  userId: string | null;
};

export const loader = async ({ request }: { request: any }) => {
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
  const navigation = useNavigation();
  const location = useLocation();

  const isNavigatingToNewPage =
    navigation.state === 'loading' &&
    !navigation.formMethod &&
    !!navigation.location &&
    navigation.location.pathname !== location.pathname;

  const pendingPath = navigation.location?.pathname;
  const isNavigatingToDashboard =
    isNavigatingToNewPage &&
    (pendingPath === '/dashboard' || pendingPath === '/');

  return (
    <ThemeProvider theme={theme}>
      <Document>
        <MainMenu loggedIn={!!userId} />
        {isNavigatingToNewPage && !isNavigatingToDashboard && (
          <LinearProgress />
        )}
        <Box m={2}>
          {isNavigatingToDashboard ? <DashboardFallback /> : <Outlet />}
        </Box>
      </Document>
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  const errorMessage =
    error instanceof Error ? error.message : 'An error occurred';

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <Typography variant="h4">App Error</Typography>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
