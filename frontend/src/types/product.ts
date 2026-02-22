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
}
