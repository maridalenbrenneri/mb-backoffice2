import { Box, Typography } from '@mui/material';
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

    return <span>{dataString}</span>;
  };

  return (
    <Box sx={{ m: 0 }}>
      <Typography sx={{ color: colors.COLOR_GREY1 }}></Typography>
      <small>{label}</small>: {renderData()}
    </Box>
  );
}
