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
  statusName: string;
  workStatusName: string | null;
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
