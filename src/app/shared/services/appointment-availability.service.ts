import { Injectable } from '@angular/core';

import { AppointmentAvailability } from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentAvailabilityService {
  public getAvailableSlots(availability: AppointmentAvailability): string[] {
    if (!availability.workingHours || !availability.firstSlot || !availability.lastSlot) {
      return [];
    }

    const firstSlot = this.toMinutes(availability.firstSlot);
    const lastSlot = this.toMinutes(availability.lastSlot);
    const slots: string[] = [];

    for (let start = firstSlot; start <= lastSlot; start += availability.slotInterval) {
      const end = start + availability.appointmentDuration;

      if (this.isAvailable(start, end, availability)) {
        slots.push(this.toTime(start));
      }
    }

    return slots;
  }

  private isAvailable(
    start: number,
    end: number,
    availability: AppointmentAvailability
  ): boolean {
    return [...availability.busySlots, ...availability.blockedSlots].every((interval) => {
      const intervalStart = this.toMinutes(interval.from);
      const intervalEnd = this.toMinutes(interval.to);

      return start >= intervalEnd || end <= intervalStart;
    });
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);

    return hours * 60 + minutes;
  }

  private toTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  }
}
