import { Box } from '@mui/material';
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
    return <span>{data || ''}</span>;
  };

  return (
    <Box sx={{ m: 0.25 }}>
      <span sx={{ color: colors.COLOR_GREY1 }}></span>
      <small>{label}</small>: {renderData()}
    </Box>
  );
}
