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
            ABO, fortnightly - a mix of estimated (estimation based on
            <small>nextPaymentDate</small> in Woo) and active renewal orders
          </li>
          <li>GABO - count from active gift subscriptions</li>
          <li>B2B - count from active B2B subscriptions</li>
          <li>Custom orders</li>
        </ul>
        <Alert severity="info">
          If an order is completed, it is still included in the overview. All
          orders with delivery on the selected Delivery day are included (except
          orders with status <small>CANCELLED / ON-HOLD / DELETED</small>)
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
          amount of orders seem reasonable.
          <p></p>
        </Alert>
        <p>When an order is completed the following process is executed:</p>
        <ol>
          <li>
            Complete order in Woo (Step ignored if parent subscription is B2B or
            GABO)
          </li>
          <li>
            Create consignment in Cargonizer (Step ignored if local delivery is
            set on parent subscription)
          </li>
          <li>Complete order in Backoffice database</li>
        </ol>
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
          The "Complete & Ship" button on the order page sets the order to
          completed in both Backoffice and Woo and (if not delivery type is set
          to <small>LOCAL_PICKUP</small>) creates a consignment and print label
          in Cargonizer.
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

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">B2B customers</Typography>
        <p>
          To create an order for a new B2B customer, first create a subcription
          with type <small>B2B</small> then, on the Subscription page, create
          new order. New orders can either be a "renewal" (Coffee types
          distributed as for any ABO) or a custom order where coffee types and
          bag sizes are specified.
        </p>
        <p>
          If the customer orders on request only, set the subscription to status{' '}
          <small>PASSIVE</small>, if renewal orders should be automatically
          created, set status to <small>ACTIVE</small>.
        </p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Woo and Backoffice</Typography>
        <p>
          Subscriptions (ABO's) are imported daily from Woo, they appear in
          Backoffice as subscriptions with type "PRIVATE". These cannot be
          edited in Backoffice (changes will be overridden).
        </p>
        <p>
          Orders from Woo are imported regularly (once an hour), only status are
          synced after initial import (i.e. if the status of an order is changed
          in Woo it will be reflected in Backoffice, but other changes are
          ignored). When status is updated in Backoffice it is also changed in
          Woo. (i.e. when completing/cancelling/etc.) This applies both for ABO
          renewal orders and single custom orders.
        </p>
        <p>
          Gift subscriptions are imported once from Woo (they are order items in
          single Woo orders), the Woo order is set to complete on import (import
          handles cases where the order also contains other order items). Gift
          subscriptions are not subscriptions in Woo, just a "single" order, so
          no further sync/updates are done after inital import. Renewal orders
          and duration of subscription is handled by Backoffice.
        </p>
      </Box>
    </main>
  );
}
