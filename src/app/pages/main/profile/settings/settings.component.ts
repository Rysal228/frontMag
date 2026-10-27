import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TuiButton } from '@taiga-ui/core';

import { AuthService } from 'app/pages/auth/services/auth.service';
import { ThemeToggleComponent } from 'app/shared/components/theme-toggle/theme-toggle.component';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';

import { PasswordDialogComponent } from '../password-dialog/password-dialog.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [PasswordDialogComponent, ThemeToggleComponent, TuiButton],
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

  protected readonly passwordDialogOpen = signal(false);

  protected readonly canChangeRole = computed(() => {
    const availableRoles = this.roleCatalog.filter(({ role }) => this.roleAccess.hasAccess(role));

    return availableRoles.length > 1;
  });

  protected changePassword(): void {
    this.passwordDialogOpen.set(true);
  }

  protected closePasswordDialog(): void {
    this.passwordDialogOpen.set(false);
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
