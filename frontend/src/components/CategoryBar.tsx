import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';

import { fetchCategories } from '../api/categories';
import { useAppDispatch } from '../app/hooks';
import { setCategoryId } from '../slices/productSlice';
import type { Category } from '../types/product';

export default function CategoryBar() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  const activeCategoryId = searchParams.get('categoryId');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    dispatch(setCategoryId(activeCategoryId ? Number(activeCategoryId) : null));
  }, [activeCategoryId, dispatch]);

  return (
    <nav className="category-bar" aria-label="Product categories">
      <div className="category-bar-inner">
        <NavLink to="/products" end className={({ isActive }) => (isActive && !activeCategoryId ? 'cat-link active' : 'cat-link')}>
          All
        </NavLink>

        {categories.map((category) => (
          <NavLink
            key={category.id}
            to={`/products?categoryId=${category.id}`}
            className={({ isActive }) =>
              isActive && activeCategoryId === String(category.id) ? 'cat-link active' : 'cat-link'
            }
          >
            {category.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
