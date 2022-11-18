import { Box } from '@mui/material';

export default function DataLabel(props: {
  label: string;
  data: string | number | null;
}) {
  const { label, data } = props;

  return (
    <Box sx={{ m: 0.25 }}>
      <small>
        <strong>{label}</strong>
      </small>
      : {data || ''}
    </Box>
  );
}
