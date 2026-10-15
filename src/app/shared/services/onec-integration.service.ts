import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OneCIntegrationApiService } from 'app/shared/api/onec-integration-api.service';
import { OneCConnectionStatus } from 'app/shared/models/onec-integration.model';

@Injectable({ providedIn: 'root' })
export class OneCIntegrationService {
  private readonly oneCIntegrationApi = inject(OneCIntegrationApiService);

  public testConnection(): Observable<OneCConnectionStatus> {
    return this.oneCIntegrationApi.testConnection();
  }
}
