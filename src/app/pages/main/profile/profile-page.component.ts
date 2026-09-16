import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';

import { AuthService } from 'app/pages/auth/services/auth.service';
import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { OrderStatus } from 'app/shared/models/order-status.model';
import { OrderStatusService } from 'app/shared/services/order-status.service';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { AppTheme, ThemeService } from 'app/shared/services/theme.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
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
    TuiHovered,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly currentUser = inject(CurrentUserStore);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly orderStatusService = inject(OrderStatusService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly roleAccess = inject(RoleAccessService);
  private readonly roleCatalog = inject(ROLE_CATALOG);
  private readonly themeService = inject(ThemeService);

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

  protected readonly theme = this.themeService.theme;

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

  protected readonly availableRoles = computed(() =>
    this.roleCatalog.filter(({ role }) => this.roleAccess.hasAccess(role))
  );

  protected readonly canChangeRole = computed(() => this.availableRoles().length > 1);

  protected onHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : NaN;
  }

  protected changeRole(): void {
    if (!this.canChangeRole()) {
      return;
    }

    void this.router.navigateByUrl('/roles');
  }

  protected setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth');
  }
}
