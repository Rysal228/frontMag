import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  CarApiResponse,
  CarApiService,
  CarNavigationResponse,
  CarPaginationResponse,
} from 'app/shared/api/car-api.service';
import { Car, CarBrand, CarModel, CreateCarRequest } from 'app/shared/models/car.model';

export type CarPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Car[];
};

export type CarNavigation = {
  previous: Car | null;
  next: Car | null;
};

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private readonly carApiService = inject(CarApiService);

  public getPage(page: number): Observable<CarPage> {
    return this.carApiService.getPage(page).pipe(map((response) => this.mapPage(response)));
  }

  public getById(id: string): Observable<Car> {
    return this.carApiService.getById(id).pipe(map((car) => this.mapCar(car)));
  }

  public getNavigation(id: string): Observable<CarNavigation> {
    return this.carApiService.getNavigation(id).pipe(map((navigation) => this.mapNavigation(navigation)));
  }

  public getBrands(): Observable<CarBrand[]> {
    return this.carApiService.getBrands();
  }

  public getModels(brandId?: number): Observable<CarModel[]> {
    return this.carApiService.getModels(brandId);
  }

  public create(request: CreateCarRequest): Observable<Car> {
    return this.carApiService.create(this.toFormData(request)).pipe(map((car) => this.mapCar(car)));
  }

  public update(id: string, request: CreateCarRequest): Observable<Car> {
    return this.carApiService.update(id, this.toFormData(request)).pipe(map((car) => this.mapCar(car)));
  }

  public delete(id: string): Observable<void> {
    return this.carApiService.delete(id);
  }

  private mapPage(response: CarPaginationResponse): CarPage {
    return {
      count: response.count,
      next: response.next,
      previous: response.previous,
      results: response.results.map((car) => this.mapCar(car)),
    };
  }

  private mapNavigation(response: CarNavigationResponse): CarNavigation {
    return {
      previous: response.previous ? this.mapCar(response.previous) : null,
      next: response.next ? this.mapCar(response.next) : null,
    };
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
      hasOrders: car.hasOrders,
    };
  }
}
