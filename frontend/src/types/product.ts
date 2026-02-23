export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: Category;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number | null;
  page?: number;
  size?: number;
}

export interface ProductPage {
  items: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
