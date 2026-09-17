export type StatusAppearance = 'positive' | 'warning' | 'negative';

export type OrderStatus = {
  id: number;
  name: string;
  appearance: StatusAppearance;
  requiresPayment: boolean;
};

export type WorkStatus = {
  id: number;
  name: string;
  appearance: StatusAppearance;
};

export type WorkType = {
  id: number;
  name: string;
};

export type Appointment = {
  id: string;
  orderNumber: string;
  car: string;
  carName: string;
  carPlateNumber: string | null;
  workType: number;
  workTypeName: string;
  status: OrderStatus;
  workStatus: WorkStatus | null;
  appointmentAt: string;
  description: string;
  price: number;
  createdAt: string;
};

export type CreateAppointmentRequest = {
  car: string;
  workType: number;
  appointmentAt: string;
  description: string;
};
