export type CarBrand = {
  id: number;
  name: string;
};

export type CarModel = {
  id: number;
  name: string;
  brand: number;
};

export type Car = {
  id: string;
  brand: number;
  brandName: string;
  model: number;
  modelName: string;
  ownerName: string;
  ownerPhone: string;
  year: number;
  vin: string | null;
  plateNumber: string | null;
  photo: string | null;
  hasOrders: boolean;
};

export type CreateCarRequest = {
  brand: number;
  model: number;
  year: number;
  vin: string | null;
  plateNumber: string | null;
  photo: File | null;
};
