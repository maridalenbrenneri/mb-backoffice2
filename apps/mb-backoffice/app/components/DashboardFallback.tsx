import { Box, Grid2, Paper, Skeleton, Typography } from '@mui/material';
import StaffSubscriptions from './StaffSubscriptions';

export function SectionSkeleton({ height }: { height: number }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Skeleton variant="rectangular" height={height} />
    </Paper>
  );
}

export function DashboardFallback() {
  return (
    <main>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Roast overview</Typography>
        <SectionSkeleton height={180} />
      </Box>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box sx={{ minWidth: 120, my: 2 }}>
            <Typography variant="h3">Published coffees</Typography>
            <SectionSkeleton height={140} />
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box sx={{ minWidth: 120, my: 2 }}>
            <Typography variant="h3">Coffees coming soon</Typography>
            <SectionSkeleton height={140} />
          </Box>
        </Grid2>
      </Grid2>

      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Subscription overview</Typography>
        <SectionSkeleton height={160} />
      </Box>

      <Typography variant="h3">Other stuff</Typography>
      <Grid2 container spacing={2}>
        <Grid2 size={{ md: 7, xl: 5 }}>
          <SectionSkeleton height={160} />
        </Grid2>
        <Grid2 size={{ md: 5, xl: 3 }}>
          <Paper sx={{ p: 1 }}>
            <StaffSubscriptions />
          </Paper>
        </Grid2>
      </Grid2>
    </main>
  );
}
