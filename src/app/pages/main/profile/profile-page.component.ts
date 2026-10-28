import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiDay, TuiHovered } from '@taiga-ui/cdk';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { MechanicStatistics } from 'app/shared/models/statistics.model';
import { StatisticsApiService } from 'app/shared/api/statistics-api.service';
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
    TuiIcon,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly currentUser = inject(CurrentUserStore);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly statisticsApi = inject(StatisticsApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = this.currentUser.user;
  protected readonly displayName = computed(() => {
    const user = this.user();
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Ваш профиль';
  });
  protected readonly initials = computed(() => {
    const user = this.user();
    return ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || 'SC';
  });
  protected readonly roleLabel = computed(() => {
    switch (this.currentRole.role()) {
      case UserRole.Admin:
        return 'Менеджер';
      case UserRole.Mechanic:
        return 'Специалист';
      case UserRole.User:
        return 'Клиент';
      default:
        return 'Пользователь';
    }
  });
  protected activeItemIndex = NaN;
  protected readonly mechanicStats = signal<MechanicStatistics | null>(null);
  protected readonly mechanicStatsLoading = signal(true);
  protected readonly mechanicStatsError = signal(false);
  protected readonly value = computed(() => {
    const stats = this.mechanicStats();
    return stats ? [stats.inProgress, stats.completed] : [0, 0];
  });
  protected readonly labels = ['В работе', 'Завершено'] as const;
  protected readonly sum = (total: number, value: number): number => total + value;

  protected readonly isMechanic = computed(() => this.currentRole.role() === UserRole.Mechanic);

  protected readonly form = new FormGroup({
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    patronymic: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    phone: new FormControl('', { nonNullable: true }),
    birthday: new FormControl('', { nonNullable: true }),
  });

  protected readonly isSaving = signal(false);
  protected readonly today = TuiDay.currentLocal();
  private statsRequested = false;

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

    effect(() => {
      if (this.isMechanic() && !this.statsRequested) {
        this.statsRequested = true;
        this.loadMechanicStats();
      }
    });
  }

  protected loadMechanicStats(): void {
    this.mechanicStatsLoading.set(true);
    this.mechanicStatsError.set(false);
    this.statisticsApi.getMechanicStatistics()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.mechanicStatsLoading.set(false))
      )
      .subscribe({
        next: (stats) => this.mechanicStats.set(stats),
        error: () => this.mechanicStatsError.set(true),
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
