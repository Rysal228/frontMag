import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { MaxBridgeService } from 'app/shared/services/max/max-bridge.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store.storage';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog.token';
import { RoleDefinition } from 'app/shared/types/roles.types';

import { RoleNavigationService } from './services/navigation.service';

@Component({
  selector: 'app-role-select',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './role-select.component.html',
  styleUrl: './role-select.component.scss',
})
export class RoleSelectComponent {
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly navigation = inject(RoleNavigationService);
  private readonly maxBridge = inject(MaxBridgeService);

  protected readonly roles = inject(ROLE_CATALOG);

  @HostBinding('attr.data-platform') protected get platform() {
    return this.maxBridge.getPlatform();
  }

  protected selectRole(definition: RoleDefinition): void {
    this.maxBridge.hapticSelection();
    this.currentRole.set(definition.role);
    void this.navigation.goToRoleHome(definition.role);
  }
}
