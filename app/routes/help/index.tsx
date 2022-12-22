import Typography from '@mui/material/Typography';
import { Alert, Box } from '@mui/material';
import { COMPLETE_ORDERS_BATCH_MAX } from '~/_libs/core/settings';

export default function JobResult() {
  return (
    <main>
      <Typography variant="h1">Help</Typography>
      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Roast overview</Typography>
        What's included / estimated
        <ul>
          <li>
            ABO, monthly - estimation from active abo's (likely new renewal
            orders)
          </li>
          <li>
            ABO, fortnightly - a mix of estimation (based on nextPaymentDate in
            Woo) and/or actual active renewal orders
          </li>
          <li>GABO - count from active gift subscriptions</li>
          <li>B2B - count from active B2B subscriptions</li>
          <li>
            Custom orders - orders with status <small>ACTIVE</small> or{' '}
            <small>COMPLETED</small> where Delivery day is set to the currently
            selected
          </li>
        </ul>
        <Alert severity="info">
          Orders (custom and fortnightly renewals) with status{' '}
          <small>COMPLETED</small> are included in overview. This is because we
          don't want the overview to change when roastig and packing at the same
          time. If there are orders you don't want in the overview, set them
          temporarly to <small>ON-HOLD</small> (or <small>CANCELLED</small> if
          they should never be packed/shipped)
        </Alert>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Packing & Shipping</Typography>
        <p>
          This is where you hang out on packing day for easy order completion
          and shipping. :)
        </p>
        <p>
          Active orders appears here grouped in "packing groups" where they can
          be completed and sent to Cargonizer in batches. Active orders set on
          the selected and previous Delivery days will be included.
        </p>
        <p>
          To be gentle with Woo and Cargonizer (and our printer, and ourselves),
          max orders sent in one batch is set to {COMPLETE_ORDERS_BATCH_MAX}.
        </p>
        <Alert severity="warning">
          If you pack/send orders later than on the ordinary shipping day
          (Tuesday), for example on a Thursday, it might have been created
          renewal orders for subscriptions that should not be sent until the
          week after, so make sure correct Delivery day is selected and the
          amount of orders seems reasonable.
          <p></p>
        </Alert>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Subscriptions</Typography>
        <p>
          Subscriptions are the heart of everything in Backoffice. All orders
          must have a parent subscription. To create a new B2B order, a
          subscription must first be created. Custom orders from Woo (not from
          subscriptions) ends up on a "system" subscription and handled as all
          other orders.
        </p>
        <Typography variant="h3">Types</Typography>
        <ul>
          <li>
            PRIVATE <small>(ABO)</small> - Imported from Woo. Renewal orders are
            created in Woo and imported to Backoffice regularly. Can NOT be
            edited in Backoffice.
          </li>
          <li>
            PRIVATE_GIFT <small>(GABO)</small> - Gift subscriptions are created
            from Woo custom orders. Renewal orders are created by Backoffice. A
            scheduled job updates status on gift subscriptions (From{' '}
            <small>NOT_STARTED</small> to <small>ACTIVE</small> or{' '}
            <small>ACTIVE</small> to <small>COMPLETED</small>). Can be edited in
            Backoffice
          </li>
          <li>
            B2B - B2B subscriptions are created and fully handled in Backoffice,
            no relation to Woo. Can be edited in Backoffice.
          </li>
        </ul>
        <p></p>
        <Typography variant="h3">Status</Typography>
        <ul>
          <li>
            ACTIVE - Renewal orders will be created automatically according to
            the frequency set on the subscription.
          </li>
          <li>
            PASSIVE - Renewal orders are not created automatically, but it's
            possible to create orders manually when needed. Used for example on
            B2B customers who wants coffee on an irregular basis or one time
            customers.
          </li>
        </ul>
        <p></p>
        <Typography variant="h3">Frequency</Typography>
        <ul>
          <li>
            MONTHLY - Renewal orders created once a month for delivery on the
            first Tuesday of the month.
          </li>
          <li>
            MONTHLY_3RD - Renewal orders created once a month for delivery on
            the third Tuesday of the month.
          </li>
          <li>
            FORTNIGHTLY - Renewal orders created every two weeks. Renewal orders
            for fortnightly private subscriptions from Woo can appear any week.
            For B2B subscriptions with fortnightly frequence renewal orders are
            created twice a month, for delivery on the first and third Tuesday
            of the month.
          </li>
        </ul>
        <p></p>
        <Typography variant="h3">Renewal orders</Typography>
        <p>
          For <small>GABO</small> and <small>B2B</small> renewal orders are
          created in Backoffice by a scheduled job (runs once a week). For{' '}
          <small>ABO</small>, renewal orders are created by Woo and imported to
          Backoffice by the import orders job (runs every hour).
        </p>
        <Alert severity="info">
          Renewal orders for <small>GABO</small> and <small>B2B</small> are
          created at 5:00 Thursday mornings the week before monthly and
          monthly_3rd delivery.
        </Alert>
        <p></p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Orders</Typography>
        <p>
          Orders also have different origins. Some are imported from Woo, some
          are generated by Backoffice (GABO, B2B renewals) and some are manually
          created in Backoffice.
        </p>
        <p>
          The "Ship" button on the order page sets the order to complete in both
          Backoffice and Woo and (if not delivery type is set to{' '}
          <small>LOCAL_PICKUP</small>) creates a consignment and print label in
          Cargonizer.
        </p>
        <p>
          If an order is updated to <small>COMPLETED</small> in the drop down,
          it is NOT completed in Woo or sent to Cargonizer.
        </p>
        <p>
          If orders that are already imported changes status in Woo, the status
          in Backoffice will be overwritten by import job (runs once an hour).
        </p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Delivery days</Typography>
        <p>
          Delivery days are automatically created when needed (by import jobs)
          but can also be created manually on the "Delivery days" page.
        </p>
        <p>
          All orders are connected to a Delivery day and the Roast overview is
          based on the orders connected to one Delivery day.
        </p>
      </Box>
    </main>
  );
}
