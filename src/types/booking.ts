export type BookingStatus = "pending" | "confirmed" | "cancelled" | "no_show";
export type PackageType = "studio_only" | "all_inclusive";
export type DurationType = "hourly" | "half_day" | "full_day";

export interface TimeSlot {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  available: boolean;
}

export interface BookingFormState {
  date: string;
  timeSlot: TimeSlot | null;
  packageType: PackageType | null;
  durationType: DurationType | null;
  isWeekday: boolean;
  selectedAddOnIds: string[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  shootType: string;
  idDocumentFile: File | null;
  bankHolderName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  termsAccepted: boolean;
}

export interface ClientDetails {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  shootType: string;
  idDocumentFile: File | null;
}

export interface BankingDetails {
  bankHolderName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
}

export interface ConfirmationEmailInput {
  clientName: string;
  clientEmail: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  packageType: string;
  durationType: string;
  addOns: string[];
  subtotal: number;
  depositAmount: number;
}
