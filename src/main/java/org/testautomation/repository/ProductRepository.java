package org.testautomation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.testautomation.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String name, Pageable pageable);
}
