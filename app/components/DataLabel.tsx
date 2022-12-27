import { Link } from '@remix-run/react';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

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
          <a href={data.dataLinkUrl} target="_blank" rel="noreferrer">
            {data.data}
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
              fontSize: 14,
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

    return <Typography sx={{ fontSize: 14 }}>{dataString}</Typography>;
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          {dataFields.map((data: any, index: number) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="left">
                <Typography
                  sx={{
                    color: colors.COLOR_GREY0,
                    fontSize: 12,
                    marginRight: 2,
                  }}
                >
                  {data.label}
                </Typography>
              </TableCell>
              <TableCell>{renderData(data)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
