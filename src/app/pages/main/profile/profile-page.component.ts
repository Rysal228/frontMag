import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiButton } from '@taiga-ui/core';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { UserRole } from 'app/shared/types/roles.types';

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
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly currentUser = inject(CurrentUserStore);
  private readonly currentRole = inject(CurrentRoleStore);

  protected readonly user = this.currentUser.user;
  protected activeItemIndex: number | null = null;
  protected readonly value = [35, 40, 10, 15, 12, 18];
  protected readonly labels = [
    'Отказано',
    'В работе',
    'На рассмотрении',
    'Выполнено',
    'Ожидают встречи',
    'Ожидают оплаты',
  ];
  protected readonly sum = (total: number, value: number): number => total + value;

  protected readonly isMechanic = computed(() => this.currentRole.role() === UserRole.Mechanic);

  protected readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    birthday: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const user = this.user();

      if (!user) {
        return;
      }

      this.form.patchValue(
        {
          fullName: [user.lastName, user.firstName, user.patronymic].filter(Boolean).join(' '),
          phone: user.phone,
          birthday: user.birthday ?? '',
        },
        { emitEvent: false },
      );
    });
  }

  protected isItemActive(index: number): boolean {
    return this.activeItemIndex === null || this.activeItemIndex === index;
  }

  protected onHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : null;
  }
}
