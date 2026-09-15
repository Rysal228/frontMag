import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TuiButton } from '@taiga-ui/core';

import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly roleCatalog = inject(ROLE_CATALOG);

  protected readonly homeRoute = computed(
    () => this.roleCatalog.find(({ role }) => role === this.currentRole.role())?.homeRoute ?? '/roles',
  );

  constructor() {
    if (!this.currentUser.user()) {
      this.currentUser.load().subscribe();
    }
  }
}
