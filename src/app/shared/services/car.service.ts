import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { Car, CarBrand, CarModel, CreateCarRequest } from 'app/shared/models/car.model';

interface CarApiResponse {
  id: string;
  brand: number;
  brandName: string;
  model: number;
  modelName: string;
  year: number;
  vin: string | null;
  plate_number: string | null;
  photo: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<Car[]> {
    return this.http.get<CarApiResponse[]>(API_ENDPOINTS.cars.list).pipe(
      map((cars) => cars.map((car) => this.mapCar(car)))
    );
  }

  public getById(id: string): Observable<Car> {
    return this.http.get<CarApiResponse>(`${API_ENDPOINTS.cars.list}${id}/`).pipe(map((car) => this.mapCar(car)));
  }

  public getBrands(): Observable<CarBrand[]> {
    return this.http.get<CarBrand[]>(API_ENDPOINTS.cars.brands);
  }

  public getModels(brandId: number): Observable<CarModel[]> {
    const params = new HttpParams().set('brand', brandId);

    return this.http.get<CarModel[]>(API_ENDPOINTS.cars.models, { params });
  }

  public create(request: CreateCarRequest): Observable<Car> {
    return this.http
      .post<CarApiResponse>(API_ENDPOINTS.cars.list, this.toFormData(request))
      .pipe(map((car) => this.mapCar(car)));
  }

  public update(id: string, request: CreateCarRequest): Observable<Car> {
    return this.http
      .patch<CarApiResponse>(`${API_ENDPOINTS.cars.list}${id}/`, this.toFormData(request))
      .pipe(map((car) => this.mapCar(car)));
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.cars.list}${id}/`);
  }

  private toFormData(request: CreateCarRequest): FormData {
    const formData = new FormData();

    formData.append('brand', String(request.brand));
    formData.append('model', String(request.model));
    formData.append('year', String(request.year));

    if (request.vin) {
      formData.append('vin', request.vin);
    }

    if (request.plateNumber) {
      formData.append('plate_number', request.plateNumber);
    }

    if (request.photo) {
      formData.append('photo', request.photo);
    }

    return formData;
  }

  private mapCar(car: CarApiResponse): Car {
    return {
      id: car.id,
      brand: car.brand,
      brandName: car.brandName,
      model: car.model,
      modelName: car.modelName,
      year: car.year,
      vin: car.vin,
      plateNumber: car.plate_number,
      photo: car.photo,
    };
  }
}
