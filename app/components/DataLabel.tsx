import { Grid, Typography } from '@mui/material';
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
    <Grid container spacing={1} sx={{ marginBottom: 0 }}>
      <Grid item xs={6} sm={3}>
        <Typography sx={{ color: colors.COLOR_GREY0, fontSize: 12 }}>
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={6} sm={9}>
        {renderData()}
      </Grid>
    </Grid>
  );
}
