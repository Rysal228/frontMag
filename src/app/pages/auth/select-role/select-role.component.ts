import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { MaxPlatform } from 'app/shared/models/max-bridge.model';
import { MaxBridgeService } from 'app/shared/services/max/max-bridge.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { RoleSelectionStore } from 'app/shared/storage/role-selection-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { RoleDefinition, UserRole } from 'app/shared/types/roles.types';

import { AuthFormService } from '../auth-form/services/auth-form.service';
import { RoleNavigationService } from './services/navigation.service';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './select-role.component.html',
  styleUrl: './select-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectRoleComponent {
  private readonly selectionStore = inject(RoleSelectionStore);
  private readonly authService = inject(AuthFormService);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly navigation = inject(RoleNavigationService);
  private readonly maxBridge = inject(MaxBridgeService);
  private readonly router = inject(Router);
  private readonly roleCatalog = inject(ROLE_CATALOG);

  protected readonly isLoading = signal(false);

  protected readonly roles = computed<RoleDefinition[]>(() => {
    const allowedRoles = new Set(this.selectionStore.state()?.roles ?? []);

    return this.roleCatalog.filter(({ role }) => allowedRoles.has(role));
  });

  @HostBinding('attr.data-platform')
  protected get platform(): MaxPlatform {
    return this.maxBridge.platform;
  }

  constructor() {
    if (!this.selectionStore.state()) {
      void this.router.navigateByUrl('/auth');
    }
  }

  protected selectRole(definition: RoleDefinition): void {
    const state = this.selectionStore.state();

    if (!state || !state.roles.includes(definition.role) || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.maxBridge.hapticSelection();

    this.authService
      .selectRole({
        selectionToken: state.selectionToken,
        role: definition.role,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.selectionStore.clear();
          this.currentRole.set(definition.role);

          this.currentUser.load().subscribe(() => {
            void this.navigation.goToRoleHome(definition.role);
          });
        },
      });
  }
}
