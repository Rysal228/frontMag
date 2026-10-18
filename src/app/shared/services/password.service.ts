import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';

export type PasswordStatus = {
  hasPassword: boolean;
};

export type PasswordChangeRequest = {
  currentPassword?: string;
  newPassword: string;
};

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private readonly http = inject(HttpClient);

  public getStatus(): Observable<PasswordStatus> {
    return this.http.get<PasswordStatus>(API_ENDPOINTS.auth.password);
  }

  public save(request: PasswordChangeRequest): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.auth.password, request);
  }
}
