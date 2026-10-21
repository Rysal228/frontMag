import { createAppointmentPayload } from './appointment-payload.util';

describe('createAppointmentPayload', () => {
  it('submits only native work type UUIDs, never workTypes free text', () => {
    const uuid = 'ed4c5fc8-cf34-4e26-bc11-8beb41d7807a';
    const payload = createAppointmentPayload(
      '13933d1e-cca7-11f1-9abc-fa163e59c328',
      '2026-10-22',
      '11:30',
      [uuid],
      ''
    );

    expect(payload).toEqual({
      car: '13933d1e-cca7-11f1-9abc-fa163e59c328',
      works: [{ workTypeId: uuid }],
      appointmentAt: '2026-10-22T11:30:00+07:00',
      description: '',
    });
    expect('workTypes' in payload).toBeFalse();
  });

  it('allows a request without any works', () => {
    expect(createAppointmentPayload('car', '2026-10-22', '09:00', []).works).toEqual([]);
  });
});
