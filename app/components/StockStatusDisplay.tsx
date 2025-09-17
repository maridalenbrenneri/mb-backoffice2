import { Box, Typography } from '@mui/material';
import { ProductStockStatus } from '~/services/entities/enums';

interface StockStatusDisplayProps {
  stockStatus: ProductStockStatus;
}

const getStockStatusLabel = (status: ProductStockStatus): string => {
  switch (status) {
    case ProductStockStatus.IN_STOCK:
      return 'In stock';
    case ProductStockStatus.ON_BACKORDER:
      return 'On backorder';
    case ProductStockStatus.OUT_OF_STOCK:
      return 'Out of stock';
    default:
      return status;
  }
};

export default function StockStatusDisplay({
  stockStatus,
}: StockStatusDisplayProps) {
  const getBackgroundColor = (status: ProductStockStatus) => {
    switch (status) {
      case ProductStockStatus.IN_STOCK:
        return '#2e7d32'; // Green
      case ProductStockStatus.ON_BACKORDER:
        return '#f57c00'; // Orange
      default:
        return 'transparent'; // No color for OUT_OF_STOCK
    }
  };

  const getTextColor = (status: ProductStockStatus) => {
    return status === ProductStockStatus.OUT_OF_STOCK ? '#000000' : '#ffffff';
  };

  const backgroundColor = getBackgroundColor(stockStatus);
  const textColor = getTextColor(stockStatus);

  if (stockStatus === ProductStockStatus.OUT_OF_STOCK) {
    return (
      <Box
        sx={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
          {getStockStatusLabel(stockStatus)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor,
        color: textColor,
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '10px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '10px',
          fontWeight: 'medium',
        }}
      >
        {getStockStatusLabel(stockStatus)}
      </Typography>
    </Box>
  );
}
