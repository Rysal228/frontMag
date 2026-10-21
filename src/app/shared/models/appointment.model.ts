export type StatusAppearance = 'positive' | 'warning' | 'negative';

export type OrderStatus = {
  id: string;
  code: string | null;
  name: string;
  appearance: StatusAppearance;
  requiresPayment: boolean;
};

export type OrderWork = {
  id: string;
  workTypeId: string | null;
  name: string;
  price: number;
};

export type PaymentStatus = {
  id: string;
  code: string;
  name: string;
  appearance: StatusAppearance;
};

export type OrderPermissions = {
  canTransitionStatus: boolean;
  canEditWorks: boolean;
  canEditPrice: boolean;
  canEditAppointment: boolean;
  canAssignMechanics: boolean;
  canEditDescription: boolean;
  canChangePaymentStatus: boolean;
};

export type WorkStatus = {
  id: string;
  code: string | null;
  name: string;
  appearance: StatusAppearance;
};

export type WorkType = {
  id: string;
  name: string;
};

export type Appointment = {
  id: string;
  orderNumber: string;
  car: string;
  carName: string;
  carYear: number;
  carVin: string | null;
  carPlateNumber: string | null;
  works: OrderWork[];
  status: OrderStatus;
  workStatus: WorkStatus | null;
  paymentStatus: PaymentStatus | null;
  permissions: OrderPermissions;
  mechanics: string[];
  appointmentAt: string;
  description: string;
  refusalReason: string;
  price: number;
  createdAt: string;
  ownerPhone?: string;
};

export type OrderFilterKey =
  | 'search'
  | 'order_number'
  | 'vin'
  | 'plate_number'
  | 'brand'
  | 'model'
  | 'work_type'
  | 'status'
  | 'work_status'
  | 'date_range';

export type OrderFilterPermissions = Record<OrderFilterKey, boolean>;

export type OrderFilters = {
  search: string;
  orderNumber: string;
  vin: string;
  plateNumber: string;
  brandId: string | null;
  modelId: string | null;
  workTypeId: number | null;
  statusId: string | null;
  workStatusId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
};

export type AppointmentPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
};

export type CreateAppointmentRequest = {
  car: string;
  works: { workTypeId: string }[];
  appointmentAt: string;
  description: string;
};

export type TimeInterval = {
  from: string;
  to: string;
};

export type AppointmentWorkingHours = {
  from: string;
  to: string;
};

export type AppointmentAvailability = {
  date: string;
  workingHours: AppointmentWorkingHours | null;
  appointmentDuration: number;
  slotInterval: number;
  dayType: 'working' | 'nonWorking';
  availableSlots: string[];
  busySlots: TimeInterval[];
  blockedSlots: TimeInterval[];
};