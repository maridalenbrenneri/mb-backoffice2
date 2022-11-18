import { Box, Typography, Paper } from '@mui/material';
import DataLabel from './DataLabel';

export default function CargonizerProfileBox(props: { profile: any }) {
  const { profile } = props;

  const plan = profile?.user?.managerships?.managership?.sender?.plan;

  if (!profile || !plan) return <Paper>Cargonizer profile not available</Paper>;

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="subtitle1">Cargonizer Profile</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel label="Username" data={profile.user.username} />
        <DataLabel
          label="Manager id"
          data={profile.user.managerships.managership.id}
        />
        <DataLabel label="Plan" data={plan.name} />
        <DataLabel label="Limit" data={plan.item_limit} />
        <DataLabel label="Count" data={plan.item_counter} />
      </Box>
    </Box>
  );
}
