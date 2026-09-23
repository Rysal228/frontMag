import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

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
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly router = inject(Router);
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

  protected readonly navigationPageIndex = signal(0);

  protected readonly navigationPages = computed(() => {
    const items = this.navigationItems();

    return [items.slice(0, 3), items.slice(3)];
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.updateNavigationPage());

    this.updateNavigationPage();

    if (!this.currentUser.user()) {
      this.currentUser.load().subscribe();
    }
  }

  private updateNavigationPage(): void {
    const currentUrl = this.router.url.split('?')[0];

    const itemIndex = this.navigationItems().findIndex(
      ({ route }) => route === currentUrl || (route !== this.homeRoute() && currentUrl.startsWith(`${route}/`))
    );

    if (itemIndex >= 0) {
      this.navigationPageIndex.set(Math.floor(itemIndex / 3));
    }
  }

  protected previousNavigationPage(): void {
    this.navigationPageIndex.update((index) => Math.max(index - 1, 0));
  }

  protected nextNavigationPage(): void {
    this.navigationPageIndex.update((index) => Math.min(index + 1, this.navigationPages().length - 1));
  }
}
