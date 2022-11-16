import { Box, Typography } from '@mui/material';

export default function DataLabel(props: { label: string; data: string }) {
  const { label, data } = props;

  return (
    <Box sx={{ m: 1 }}>
      <small>
        <strong>{label}</strong>
      </small>
      : {data}
    </Box>
  );
}
