import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { CurrentUser } from 'app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  public getProfile(): Observable<CurrentUser> {
    return this.http.get<{ user: CurrentUser }>(API_ENDPOINTS.users.profile).pipe(
      map(({ user }) => user),
    );
  }
}
