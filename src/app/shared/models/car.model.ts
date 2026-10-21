export type CarBrand = {
  id: string;
  name: string;
};

export type CarModel = {
  id: string;
  name: string;
  brand: string;
};

export type Car = {
  id: string;
  brand: string;
  brandName: string;
  model: string;
  modelName: string;
  ownerName: string;
  ownerPhone: string;
  year: number;
  vin: string | null;
  plateNumber: string | null;
  photo: string | null;
  hasOrders: boolean;
  status: 'active' | 'archived';
};

export type CarFilters = {
  status: 'active' | 'archived' | 'all';
  ownerPhone: string;
  brandId: string | null;
  modelId: string | null;
  year: number | null;
  vin: string;
  plateNumber: string;
};

export type CreateCarRequest = {
  brand: string;
  model: string;
  year: number;
  vin: string | null;
  plateNumber: string | null;
  photo: File | null;
};
