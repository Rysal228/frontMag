import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
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
  private static readonly NAVIGATION_PAGE_SIZE = 3;
  private static readonly MOBILE_BREAKPOINT = '(max-width: 767px)';

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
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

  private readonly mobileMediaQuery =
    typeof window !== 'undefined' ? window.matchMedia(AppShellComponent.MOBILE_BREAKPOINT) : null;

  protected readonly isMobile = signal(this.mobileMediaQuery?.matches ?? false);
  protected readonly navigationPageIndex = signal(0);

  protected readonly isCarouselMode = computed(
    () => this.isMobile() || this.navigationItems().length > 5,
  );

  protected readonly navigationPages = computed(() => {
    const items = this.navigationItems();
    const pageSize = AppShellComponent.NAVIGATION_PAGE_SIZE;

    return Array.from(
      { length: Math.ceil(items.length / pageSize) },
      (_, index) => items.slice(index * pageSize, (index + 1) * pageSize),
    );
  });

  constructor() {
    if (this.mobileMediaQuery) {
      const updateMobileState = (event: MediaQueryListEvent): void => this.isMobile.set(event.matches);

      this.mobileMediaQuery.addEventListener('change', updateMobileState);
      this.destroyRef.onDestroy(() =>
        this.mobileMediaQuery?.removeEventListener('change', updateMobileState),
      );
    }

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
      this.navigationPageIndex.set(Math.floor(itemIndex / AppShellComponent.NAVIGATION_PAGE_SIZE));
    }
  }

  protected previousNavigationPage(): void {
    this.navigationPageIndex.update((index) => Math.max(index - 1, 0));
  }

  protected nextNavigationPage(): void {
    this.navigationPageIndex.update((index) => Math.min(index + 1, this.navigationPages().length - 1));
  }
}
