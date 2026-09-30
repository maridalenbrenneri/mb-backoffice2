import { Box, Typography } from '@mui/material';

interface StockDisplayProps {
  stockRemaining: number;
  stockRemainingWarning?: number;
  unit?: string;
}

export default function StockDisplay({
  stockRemaining,
  stockRemainingWarning = 17,
  unit = 'kg',
}: StockDisplayProps) {
  let getBackgroundColor = (stock: number) => {
    if (stock > stockRemainingWarning) return '#2e7d32'; // Green
    if (stock >= 1) return '#f57c00'; // Orange
    return 'red';
  };

  let backgroundColor = getBackgroundColor(stockRemaining);

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
          color: '#ffffff',
        }}
      >
        {stockRemaining ? `${stockRemaining}${unit}` : '-'}
      </Typography>
    </Box>
  );
}
