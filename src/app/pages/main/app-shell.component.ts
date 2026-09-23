import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TuiButton, TuiIconButton } from '@taiga-ui/core';
import { TuiCarousel } from '@taiga-ui/kit';

import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { RoleDefinition } from 'app/shared/types/roles.types';

type NavigationItem = RoleDefinition & {
  readonly route: string;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton, TuiIconButton, TuiCarousel],
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

  protected readonly navigationItems = computed<NavigationItem[]>(() => [
    {
      role: this.currentRole.role(),
      label: 'Главная',
      icon: '@tui.house',
      appearance: 'secondary',
      homeRoute: this.homeRoute(),
      route: this.homeRoute(),
    },
    {
      role: this.currentRole.role(),
      label: 'Мои авто',
      icon: '@tui.car',
      appearance: 'secondary',
      homeRoute: this.homeRoute(),
      route: '/cars',
    },
    {
      role: this.currentRole.role(),
      label: 'Записи',
      icon: '@tui.calendar',
      appearance: 'secondary',
      homeRoute: this.homeRoute(),
      route: '/appointments',
    },
    {
      role: this.currentRole.role(),
      label: 'Профиль',
      icon: '@tui.user',
      appearance: 'secondary',
      homeRoute: this.homeRoute(),
      route: '/profile',
    },
  ]);

  protected readonly navigationPages = computed(() => {
    const items = this.navigationItems();

    return [items.slice(0, 3), items.slice(3)];
  });

  constructor() {
    if (!this.currentUser.user()) {
      this.currentUser.load().subscribe();
    }
  }
}
