import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

import { ProductStatus, type ProductEntity } from '~/services/entities';
import { getValidationForCoffee } from '~/utils/product-utils';

export default function ProductWebshopStatus({
  product,
}: {
  product: ProductEntity;
}) {
  const validation = getValidationForCoffee(product);

  return (
    <div>
      {product.status === ProductStatus.PUBLISHED ? (
        <span
          style={{
            backgroundColor: '#2e7d32',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 10,
            display: 'inline-block',
          }}
        >
          YES
        </span>
      ) : product.status === ProductStatus.PRIVATE ||
        product.status === ProductStatus.DRAFT ? (
        <div>
          <small>No</small>
          <Tooltip title={validation.message}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                verticalAlign: 'middle',
              }}
            >
              {validation.kind === 'success' && (
                <CheckCircleIcon
                  color="success"
                  fontSize="small"
                  sx={{ marginLeft: 0.5, marginBottom: 0.5 }}
                />
              )}
              {validation.kind === 'warning' && (
                <WarningIcon
                  color="warning"
                  fontSize="small"
                  sx={{ marginLeft: 0.5, marginBottom: 0.5 }}
                />
              )}
              {validation.kind === 'error' && (
                <ErrorIcon
                  color="error"
                  fontSize="small"
                  sx={{ marginLeft: 0.5, marginBottom: 0.5 }}
                />
              )}
            </span>
          </Tooltip>
        </div>
      ) : (
        <small>{product.status}</small>
      )}
    </div>
  );
}
