import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

export default function JobResult() {
  return (
    <main>
      <Typography variant="h1">Help</Typography>
      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Roast overview</Typography>
        <p></p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Subscriptions</Typography>
        Subscriptions origin from three different sources.
        <ul>
          <li>Subscriptions imported from Woo (private)</li>
          <li>
            Gift subscriptions, imported one-time from Woo as single orders,
            when imported a subscription is created in Backoffice{' '}
          </li>
          <li>B2B subscriptions are created manually in Backoffice</li>
        </ul>
        <p>
          All orders in Backoffice has a subscription. To create a new B2B
          order, a subscription must first be created.
        </p>
        <Typography variant="h3">Types</Typography>
        <Typography variant="h6">PRIVATE</Typography>
        <p>
          Imported from Woo. Renewal orders are created in Woo and imported to
          Backoffice regualarly. Subscriptions from Woo cannot be edited in
          Backoffice.
        </p>
        <Typography variant="h6">PRIVATE_GIFT</Typography>
        <p>
          Gift subscriptions are imported from Woo as single orders. Renewal
          orders are created by Backoffice. Can be edited in Backoffice.
        </p>
        <Typography variant="h6">B2B</Typography>
        <p>
          B2B subscriptions are created in Backoffice, no relation to Woo.
          Renewal orders are created by Backoffice. Can be edited in Backoffice.
        </p>
        <Typography variant="h3">Status</Typography>
        <Typography variant="h6">ACTIVE</Typography>
        <p>
          Renewal orders will be created automatically according to the
          frequency set on the subscription.
        </p>
        <Typography variant="h6">PASSIVE</Typography>
        <p>
          Rewenal orders not created automatically, but it's possible to create
          orders manually when needed. Can for example be used for B2B customers
          who orders from time to time or one time customers.
        </p>
        <Typography variant="h3">Frequency</Typography>
        <Typography variant="h6">MONTHLY</Typography>
        <p>
          Renewal orders created once a month for delivery on the first Tuesday
          of the month.
        </p>
        <Typography variant="h6">MONTHLY_3RD</Typography>
        <p>
          Renewal orders created once a month for delivery on the third Tuesday
          of the month.
        </p>
        <Typography variant="h6">FORTNIGHTLY</Typography>
        <p>
          Renewal orders created every two weeks. Renewal orders for fortnightly
          private subscriptions from Woo can appear any week. For B2B
          subscriptions with fortnightly frequence renewal orders are created
          twice a month, for delivery on the first and third Tuesday of the
          month.
        </p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Orders</Typography>
        <p></p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Packing & Shipping</Typography>
        <p></p>
      </Box>
    </main>
  );
}
