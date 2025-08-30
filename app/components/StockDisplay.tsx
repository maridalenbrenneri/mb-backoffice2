import { Edit } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

interface StockDisplayProps {
  stockRemaining: number;
}

export default function StockDisplay({ stockRemaining }: StockDisplayProps) {
  const getBackgroundColor = (stock: number) => {
    if (stock > 17) return '#2e7d32'; // Green
    if (stock >= 1) return '#f57c00'; // Orange
    return 'transparent'; // No color for 0
  };

  const getTextColor = (stock: number) => {
    if (stock > 1) return '#ffffff'; // White text on colored boxes
    return '#000000'; // Black text on transparent
  };

  const backgroundColor = getBackgroundColor(stockRemaining);
  const textColor = getTextColor(stockRemaining);

  return (
    <Box
      sx={{
        backgroundColor,
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'inline-block',
        minWidth: '60px',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 'medium',
          fontSize: '8',
          color: textColor,
        }}
      >
        {stockRemaining ? `${stockRemaining}kg` : '-'}
      </Typography>
    </Box>
  );
}
