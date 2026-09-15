import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { CurrentUserStore } from 'app/shared/storage/current-user-store';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly currentUser = inject(CurrentUserStore);

  protected readonly user = this.currentUser.user;

  protected readonly fullName = computed(() => {
    const user = this.user();

    return [user?.lastName, user?.firstName, user?.patronymic].filter(Boolean).join(' ');
  });

  protected readonly birthday = computed(() => {
    const value = this.user()?.birthday;

    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('-');

    return `${day}.${month}.${year}`;
  });
}
