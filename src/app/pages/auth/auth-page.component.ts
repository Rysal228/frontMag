import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { AuthFormComponent } from './auth-form/auth-form.component';
import { RegFormComponent } from './reg-form/reg-form.component';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [TuiButton, AuthFormComponent, RegFormComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPageComponent {
  protected readonly mode = signal<AuthMode>('login');

  protected toggleMode(): void {
    this.mode.update((mode) => (mode === 'login' ? 'register' : 'login'));
  }
}
