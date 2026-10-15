import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { OneCConnectionStatus } from 'app/shared/models/onec-integration.model';

@Injectable({ providedIn: 'root' })
export class OneCIntegrationApiService {
  private readonly http = inject(HttpClient);

  public testConnection(): Observable<OneCConnectionStatus> {
    return this.http.get<OneCConnectionStatus>(
      API_ENDPOINTS.integrations.oneCConnectionTest,
    );
  }
}
