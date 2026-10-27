import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { ThemeService } from 'app/shared/services/theme.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { UserRole } from 'app/shared/types/roles.types';

type NavigationItem = {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton, TuiIcon],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private static readonly NAVIGATION_PAGE_SIZE = 3;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly themeService = inject(ThemeService);
  private readonly roleCatalog = inject(ROLE_CATALOG);
  private touchStartX: number | null = null;

  protected readonly theme = this.themeService.effectiveTheme;
  protected readonly currentSection = signal('Главная');
  protected readonly roleLabel = computed(() => {
    switch (this.currentRole.role()) {
      case UserRole.Admin:
        return 'Менеджер';
      case UserRole.Mechanic:
        return 'Специалист';
      default:
        return 'Пользователь';
    }
  });
  protected readonly userInitials = computed(() => {
    const user = this.currentUser.user();
    return ((user?.lastName?.[0] ?? '') + (user?.firstName?.[0] ?? '')).toUpperCase() || 'CSC';
  });

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
      label: 'Авто',
      icon: '@tui.car',
      route: '/cars',
    },
    {
      label: 'Записи',
      icon: '@tui.calendar',
      route: '/appointments',
    },
    ...(this.currentRole.role() === 'admin'
      ? [{ label: 'Статистика', icon: '@tui.chart-column', route: '/statistics' }]
      : []),
    {
      label: 'Профиль',
      icon: '@tui.user',
      route: '/profile',
    },
  ]);

  protected readonly navigationPageIndex = signal(0);

  protected readonly navigationPages = computed(() => {
    const items = this.navigationItems();
    const pageSize = AppShellComponent.NAVIGATION_PAGE_SIZE;

    return Array.from({ length: Math.ceil(items.length / pageSize) }, (_, index) =>
      items.slice(index * pageSize, (index + 1) * pageSize)
    );
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
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
      this.currentSection.set(this.navigationItems()[itemIndex].label);
    }
  }

  protected toggleTheme(): void {
    this.themeService.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  protected onNavigationTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  protected onNavigationTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0]?.clientX;
    if (this.touchStartX === null || endX === undefined) {
      return;
    }

    const distance = endX - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(distance) < 55) {
      return;
    }

    if (distance < 0) {
      this.nextNavigationPage();
    } else {
      this.previousNavigationPage();
    }
  }

  protected previousNavigationPage(): void {
    this.navigationPageIndex.update((index) => Math.max(index - 1, 0));
  }

  protected nextNavigationPage(): void {
    this.navigationPageIndex.update((index) => Math.min(index + 1, this.navigationPages().length - 1));
  }
}
