// BUSINESS SETTINGS
export const WEIGHT_STANDARD_PACKAGING = 150; // grams
export const SUBSCRIPTION_RENEWAL_WEEKDAY = 4; // 1 is Monday and 7 is Sunday

// CARGONIZER
export const CARGONIZER_API_URL = 'https://cargonizer.no';
export const CARGONIZER_SENDER_ID = '6350';
export const CARGONIZER_TRANSPORT_AGREEMENT = '13654';
export const CARGONIZER_PRINTER_ID = 1057;
export const CARGONIZER_PRODUCT_BUSINESS = 'bring2_business_parcel';
export const CARGONIZER_PRODUCT_PRIVATE = 'bring2_small_parcel_a_no_rfid';
export const CARGONIZER_PRODUCT_PRIVATE_SERVICE =
  'bring2_delivery_to_door_handle';

// FIKEN
export const FIKEN_API_URL = 'https://api.fiken.no/api/v2';
export const FIKEN_CONTACT_URL = `https://fiken.no/foretak/maridalen-brenneri-as/kontakter/kontakt/`;
export const FIKEN_COMPANY_SLUG = 'maridalen-brenneri-as';

// WOO
export const WOO_NO_SHIPPING_COUPON = 'nullfrakt2018';
export const WOO_GABO_PRODUCT_ID = 968;
export const WOO_ABO_PRODUCT_ID = 456;
export const WOO_ABO_PRODUCT_VARIATION_1_1 = 569;
export const WOO_ABO_PRODUCT_VARIATION_2_1 = 572;
export const WOO_ABO_PRODUCT_VARIATION_3_1 = 575;
export const WOO_ABO_PRODUCT_VARIATION_4_1 = 578;
export const WOO_ABO_PRODUCT_VARIATION_5_1 = 581;
export const WOO_ABO_PRODUCT_VARIATION_6_1 = 4441;
export const WOO_ABO_PRODUCT_VARIATION_7_1 = 4442;
export const WOO_ABO_PRODUCT_VARIATION_1_2 = 568;
export const WOO_ABO_PRODUCT_VARIATION_2_2 = 571;
export const WOO_ABO_PRODUCT_VARIATION_3_2 = 574;
export const WOO_ABO_PRODUCT_VARIATION_4_2 = 577;
export const WOO_ABO_PRODUCT_VARIATION_5_2 = 580;
export const WOO_ABO_PRODUCT_VARIATION_6_2 = 31052;
export const WOO_ABO_PRODUCT_VARIATION_7_2 = 31053;

export const WOO_PRODUCT_CATEGORY_BUTIKK_ID = 19;
export const WOO_PRODUCT_REGULAR_PRICE_DEFAULT = '140';
export const WOO_PRODUCT_WEIGHT_DEFAULT = '250';
export const WOO_PRODUCT_SHIPPING_CLASS_DEFAULT = 'frakt-vanlig';

export const WOO_IMPORT_SUBSCRIPTIONS_FROM_TODAY_MINUS_DAYS = 1;

export const WOO_IMPORT_ORDERS_FROM_TODAY_MINUS_DAYS = 1;
export const WOO_IMPORT_PRODUCTS_UPDATED_TODAY_MINUS_DAYS = 30;

// SYSADMIN
export const TAKE_MAX_ROWS = 500;
export const TAKE_DEFAULT_ROWS = 30;

export const COMPLETE_ORDERS_DELAY = 400; // milliseconds. being gentle with requests to Cargonizer and Woo on completeing multiple orders (small delay between every 5th request)
export const COMPLETE_ORDERS_BATCH_MAX = 50;

export const WOO_RENEWALS_SUBSCRIPTION_ID = 1;
export const WOO_NON_RECURRENT_SUBSCRIPTION_ID = 2;

// STAFF
export const STAFF_SUBSCRIPTIONS = [
  194507, // Reiar
  194506, // Jørgen
  194508, // Petter
  194466, // Audun
  7473, // Björn
];

// TODO: Images is work-in-progress, not sure we shold ever set it in Backoffice
// curl "https://maridalenbrenneri.no/wp-json/wp/v2/media?per_page=100&media_type=image"
export const DefaultCoffeeImages = [
  {
    country: 'Kenya',
    wooMediaId: 52974,
  },
];
