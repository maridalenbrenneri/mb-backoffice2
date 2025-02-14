import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import {
  ShippingType,
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '~/_libs/core/repositories/subscription/types';

export const renderTypes = (type: SubscriptionType = SubscriptionType.B2B) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`customer-label`}>Type</InputLabel>
      <Select
        labelId={`type-label`}
        defaultValue={type}
        sx={{ minWidth: 250 }}
        disabled
        size="small"
      >
        {Object.keys(SubscriptionType).map((type: any) => (
          <MenuItem value={type} key={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const renderStatus = (
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
  disabled = false
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`status-label`}>Status</InputLabel>
      <Select
        disabled={disabled}
        labelId={`status-label`}
        name={`status`}
        defaultValue={status}
        sx={{ minWidth: 250 }}
        size="small"
      >
        {Object.keys(SubscriptionStatus).map((status: any) => (
          <MenuItem value={status} key={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const renderFrequency = (
  frequency: SubscriptionFrequency = SubscriptionFrequency.MONTHLY,
  disabled = false
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`frequency-label`}>Frequency</InputLabel>
      <Select
        disabled={disabled}
        labelId={`frequency-label`}
        name={`frequency`}
        defaultValue={frequency}
        sx={{ minWidth: 250 }}
        size="small"
      >
        {Object.keys(SubscriptionFrequency).map((freq: any) => (
          <MenuItem value={freq} key={freq}>
            {freq}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const renderShippingTypes = (
  shippingType: ShippingType = ShippingType.SHIP,
  disabled = false
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`shipping-type-label`}>Shipping type</InputLabel>
      <Select
        disabled={disabled}
        labelId={`shipping-type-label`}
        name={`shippingType`}
        defaultValue={shippingType}
        sx={{ minWidth: 250 }}
        size="small"
      >
        {Object.keys(ShippingType).map((type: any) => (
          <MenuItem value={type} key={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
