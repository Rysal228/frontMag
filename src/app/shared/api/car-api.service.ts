import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { CarBrand, CarModel } from 'app/shared/models/car.model';

export type CarApiResponse = {
  id: string;
  brand: number;
  brandName: string;
  model: number;
  modelName: string;
  year: number;
  vin: string | null;
  plate_number: string | null;
  photo: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class CarApiService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<CarApiResponse[]> {
    return this.http.get<CarApiResponse[]>(API_ENDPOINTS.cars.list);
  }

  public getById(id: string): Observable<CarApiResponse> {
    return this.http.get<CarApiResponse>(`${API_ENDPOINTS.cars.list}${id}/`);
  }

  public getBrands(): Observable<CarBrand[]> {
    return this.http.get<CarBrand[]>(API_ENDPOINTS.cars.brands);
  }

  public getModels(brandId: number): Observable<CarModel[]> {
    const params = new HttpParams().set('brand', brandId);

    return this.http.get<CarModel[]>(API_ENDPOINTS.cars.models, { params });
  }

  public create(data: FormData): Observable<CarApiResponse> {
    return this.http.post<CarApiResponse>(API_ENDPOINTS.cars.list, data);
  }

  public update(id: string, data: FormData): Observable<CarApiResponse> {
    return this.http.patch<CarApiResponse>(`${API_ENDPOINTS.cars.list}${id}/`, data);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.cars.list}${id}/`);
  }
}
