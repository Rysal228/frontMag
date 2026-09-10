import { Component } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './auth-form.component.html',
})
export class AuthFormComponent {}
