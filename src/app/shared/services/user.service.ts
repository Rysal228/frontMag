import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { CurrentUser, Mechanic, UpdateProfileRequest } from 'app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  public getProfile(): Observable<CurrentUser> {
    return this.http.get<{ user: CurrentUser }>(API_ENDPOINTS.users.profile).pipe(map(({ user }) => user));
  }

  public getMechanics(search = '', ids: string[] = []): Observable<Mechanic[]> {
    let params = new HttpParams().set('role', 'mechanic');

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (ids.length) {
      params = params.set('ids', ids.join(','));
    }

    return this.http.get<Mechanic[]>(API_ENDPOINTS.users.list, { params });
  }

  public updateProfile(profile: UpdateProfileRequest): Observable<CurrentUser> {
    return this.http.patch<{ user: CurrentUser }>(API_ENDPOINTS.users.profile, profile).pipe(map(({ user }) => user));
  }
}
