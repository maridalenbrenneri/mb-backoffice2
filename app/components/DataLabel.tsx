import { Link } from '@remix-run/react';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { colors } from '~/style/colors';
export default function DataLabel(props: {
  dataFields: [
    {
      label: string;
      data: string | number | null;
      dataLinkUrl?: string | null | undefined;
      onClick?: any | undefined;
    }
  ];
}) {
  const { dataFields } = props;

  const renderData = (data: any) => {
    if (data.dataLinkUrl) {
      if (data.dataLinkUrl.startsWith('http')) {
        return (
          <a
            href={data.dataLinkUrl || ''}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'underline',
              color: '##0000EE',
            }}
          >
            {data.data}
            <OpenInNewIcon fontSize="small" sx={{ opacity: 0.6 }} />
          </a>
        );
      }
      return <Link to={data.dataLinkUrl}>{data.data}</Link>;
    }

    if (data.onClick) {
      return (
        <>
          <span>{data.data}</span>
          <Button
            sx={{
              fontSize: 11,
              p: 0.25,
              marginLeft: 1,
            }}
            onClick={data.onClick}
            variant="contained"
          >
            <Edit />
          </Button>
        </>
      );
    }

    const dataString =
      data.data === undefined || data.data === null ? '' : data.data;

    return <Typography sx={{ fontSize: 11 }}>{dataString}</Typography>;
  };

  return (
    <Table
      size="small"
      sx={{
        width: 'fit-content',
        tableLayout: 'auto',
      }}
    >
      <TableBody>
        {dataFields.map((data: any, index: number) => (
          <TableRow
            key={index}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell
              align="left"
              sx={{
                width: 'auto',
                maxWidth: 'fit-content',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography
                sx={{
                  color: colors.COLOR_GREY0,
                  fontSize: 10,
                }}
              >
                {data.label}
              </Typography>
            </TableCell>
            <TableCell
              sx={{
                width: 'auto',
                maxWidth: 'fit-content',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ marginLeft: '10px' }}>{renderData(data)}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
