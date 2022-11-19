import { Box } from '@mui/material';
import { Link } from '@remix-run/react';

export default function DataLabel(props: {
  label: string;
  data: string | number | null;
  dataLinkUrl?: string | null | undefined;
}) {
  const { label, data, dataLinkUrl } = props;

  const renderData = () => {
    if (dataLinkUrl) {
      return <Link to={dataLinkUrl}>{data}</Link>;
    }
    return <span>{data || ''}</span>;
  };

  return (
    <Box sx={{ m: 0.25 }}>
      <small>
        <strong>{label}</strong>
      </small>
      : {renderData()}
    </Box>
  );
}
