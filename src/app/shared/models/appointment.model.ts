export type StatusAppearance = 'positive' | 'warning' | 'negative';

export type AppointmentStatus = {
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
  status: AppointmentStatus;
  workStatus: AppointmentStatus | null;
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
