import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { OrderStatus } from 'app/shared/models/order-status.model';
import { OrderStatusService } from 'app/shared/services/order-status.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { UserRole } from 'app/shared/types/roles.types';

import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    DateFieldComponent,
    FormFieldComponent,
    ReactiveFormsModule,
    TextFieldComponent,
    TuiButton,
    TuiLegendItem,
    TuiRingChart,
    TuiHovered,
    SettingsComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly currentUser = inject(CurrentUserStore);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly orderStatusService = inject(OrderStatusService);

  protected readonly user = this.currentUser.user;
  protected activeItemIndex = NaN;
  // тестовые данные под замену в будущем
  private readonly testValues = [35, 40, 10, 15, 12, 18];

  protected readonly value = computed(() => this.orderStatuses().map((_, index) => this.testValues[index] ?? 0));
  //
  protected readonly orderStatuses = signal<OrderStatus[]>([]);

  protected readonly labels = computed(() => this.orderStatuses().map(({ name }) => name));

  protected readonly sum = (total: number, value: number): number => total + value;

  protected readonly isMechanic = computed(() => this.currentRole.role() === UserRole.Mechanic);

  protected readonly form = new FormGroup({
    lastName: new FormControl('', { nonNullable: true }),
    firstName: new FormControl('', { nonNullable: true }),
    patronymic: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    birthday: new FormControl('', { nonNullable: true }),
  });

  protected readonly isSaving = signal(false);

  constructor() {
    this.form.controls.phone.disable();

    effect(() => {
      const user = this.user();

      if (!user) {
        return;
      }

      this.form.patchValue(
        {
          lastName: user.lastName,
          firstName: user.firstName,
          patronymic: user.patronymic,
          phone: user.phone,
          birthday: user.birthday ?? '',
        },
        { emitEvent: false }
      );
    });

    if (this.isMechanic()) {
      this.loadOrderStatuses();
    }
  }

  private loadOrderStatuses(): void {
    this.orderStatusService.getAll().subscribe((statuses) => {
      this.orderStatuses.set(statuses);
    });
  }

  protected isItemActive(index: number): boolean {
    return Number.isNaN(this.activeItemIndex) || this.activeItemIndex === index;
  }

  protected onHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : NaN;
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      return;
    }

    const { lastName, firstName, patronymic, birthday } = this.form.getRawValue();

    this.isSaving.set(true);

    this.currentUser
      .update({
        lastName,
        firstName,
        patronymic,
        birthday: birthday || null,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe();
  }
}
