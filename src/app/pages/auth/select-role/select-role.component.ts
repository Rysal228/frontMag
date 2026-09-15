import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { MaxPlatform } from 'app/shared/models/max-bridge.model';
import { MaxBridgeService } from 'app/shared/services/max/max-bridge.service';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { RoleDefinition } from 'app/shared/types/roles.types';

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
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly roleAccess = inject(RoleAccessService);
  private readonly navigation = inject(RoleNavigationService);
  private readonly maxBridge = inject(MaxBridgeService);

  protected readonly roles = inject(ROLE_CATALOG).filter(({ role }) => this.roleAccess.hasAccess(role));

  @HostBinding('attr.data-platform')
  protected get platform(): MaxPlatform {
    return this.maxBridge.platform;
  }

  protected selectRole(definition: RoleDefinition): void {
    if (!this.currentUser.user() || !this.roleAccess.hasAccess(definition.role)) {
      return;
    }

    this.maxBridge.hapticSelection();
    this.currentRole.set(definition.role);
    void this.navigation.goToRoleHome(definition.role);
  }
}
