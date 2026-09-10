import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { MaxPlatform } from 'app/shared/models/max-bridge.model';
import { MaxBridgeService } from 'app/shared/services/max/max-bridge.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { RoleDefinition } from 'app/shared/types/roles.types';

import { RoleNavigationService } from './services/navigation.service';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './select-role.component.html',
  styleUrl: './select-role.component.scss',
})
export class SelectRoleComponent {
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly navigation = inject(RoleNavigationService);
  private readonly maxBridge = inject(MaxBridgeService);

  protected readonly roles = inject(ROLE_CATALOG);

  @HostBinding('attr.data-platform')
  protected get platform(): MaxPlatform {
    return this.maxBridge.platform;
  }

  protected selectRole(definition: RoleDefinition): void {
    this.maxBridge.hapticSelection();
    this.currentRole.set(definition.role);
    void this.navigation.goToRoleHome(definition.role);
  }
}
