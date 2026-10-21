import { CreateAppointmentRequest } from 'app/shared/models/appointment.model';

/**
 * Public order API now accepts 1C catalog UUIDs, not free-text names.
 * The service and 1C interpret appointment time in Asia/Krasnoyarsk (+07:00).
 */
export function createAppointmentPayload(
  car: string,
  date: string,
  time: string,
  workTypeIds: string[],
  description = ''
): CreateAppointmentRequest {
  return {
    car,
    works: workTypeIds.map((workTypeId) => ({ workTypeId })),
    appointmentAt: `${date}T${time}:00+07:00`,
    description,
  };
}
