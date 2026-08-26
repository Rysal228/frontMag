import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

type MaxAuthRequest = {
  initData: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  public async authenticateWithMax(initData: string): Promise<AuthResponse> {
    return firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/max', {
        initData,
      } satisfies MaxAuthRequest)
    );
  }
}
