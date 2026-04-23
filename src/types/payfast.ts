export interface BookingPayfastInput {
  merchantId: string;
  merchantKey: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  mPaymentId: string;
  amount: string; // Formatted to 2 decimal places, e.g. "1750.00"
  itemName: string;
  itemDescription?: string;
  emailAddress?: string;
  nameFirst?: string;
  nameLast?: string;
}
