import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { TuiButton, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { AuthService } from 'app/pages/auth/services/auth.service';
import { ThemeToggleComponent } from 'app/shared/components/theme-toggle/theme-toggle.component';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';

import { PasswordDialogComponent } from '../password-dialog/password-dialog.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ThemeToggleComponent, TuiButton],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly roleAccess = inject(RoleAccessService);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly roleCatalog = inject(ROLE_CATALOG);
  private readonly dialogs = inject(TuiDialogService);

  protected readonly canChangeRole = computed(() => {
    const availableRoles = this.roleCatalog.filter(({ role }) => this.roleAccess.hasAccess(role));

    return availableRoles.length > 1;
  });

  protected changePassword(): void {
    this.dialogs
      .open(new PolymorpheusComponent(PasswordDialogComponent), {
        size: 's',
      })
      .subscribe();
  }

  protected changeRole(): void {
    if (!this.canChangeRole()) {
      return;
    }

    void this.router.navigateByUrl('/role-switch');
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth');
  }
}
