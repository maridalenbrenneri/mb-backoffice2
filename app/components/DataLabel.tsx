import { Box, Grid, Typography } from '@mui/material';
import { Link } from '@remix-run/react';
import { colors } from '~/style/colors';

export default function DataLabel(props: {
  label: string;
  data: string | number | null;
  dataLinkUrl?: string | null | undefined;
}) {
  const { label, data, dataLinkUrl } = props;

  const renderData = () => {
    if (dataLinkUrl) {
      if (dataLinkUrl.startsWith('http')) {
        return (
          <a href={dataLinkUrl} target="_blank" rel="noreferrer">
            {data}
          </a>
        );
      }
      return <Link to={dataLinkUrl}>{data}</Link>;
    }

    const dataString = data === undefined || data === null ? '' : data;

    return <Typography>{dataString}</Typography>;
  };

  return (
    <Box sx={{ marginBottom: 0 }}>
      <div style={{ display: 'flex' }}>
        <Typography
          sx={{ color: colors.COLOR_GREY0, fontSize: 12, marginRight: 2 }}
        >
          {label}:
        </Typography>

        {renderData()}
      </div>
    </Box>
  );
}
