import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TuiItem } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';
import { TuiCarousel } from '@taiga-ui/kit';

import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';

type NavigationItem = {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton, TuiCarousel, TuiItem],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly roleCatalog = inject(ROLE_CATALOG);

  protected readonly homeRoute = computed(
    () => this.roleCatalog.find(({ role }) => role === this.currentRole.role())?.homeRoute ?? '/roles'
  );

  protected readonly navigationItems = computed<NavigationItem[]>(() => [
    {
      label: 'Главная',
      icon: '@tui.house',
      route: this.homeRoute(),
    },
    {
      label: 'Мои авто',
      icon: '@tui.car',
      route: '/cars',
    },
    {
      label: 'Записи',
      icon: '@tui.calendar',
      route: '/appointments',
    },
    {
      label: 'Профиль',
      icon: '@tui.user',
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
