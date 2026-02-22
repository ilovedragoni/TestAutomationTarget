package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.converter.ProductConverter;
import org.testautomation.domain.ProductDTO;
import org.testautomation.entity.Product;
import org.testautomation.repository.CategoryRepository;
import org.testautomation.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductConverter productConverter;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductConverter productConverter) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productConverter = productConverter;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> findAll() {
        final List<Product> products = productRepository.findAll();

        return products.stream()
                .map(productConverter::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ProductDTO> findById(Long id) {
        return productRepository.findById(id)
                .map(productConverter::toDto);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> searchByName(String name) {
        final String trimmedName = name.trim();
        return productRepository.findByNameContainingIgnoreCase(trimmedName).stream()
                .map(productConverter::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> search(String name, Long categoryId) {
        if (name != null && !name.isBlank()) {
            final String trimmedName = name.trim();

            return productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, trimmedName).stream()
                    .map(productConverter::toDto)
                    .toList();
        }

        return productRepository.findByCategoryId(categoryId).stream()
                .map(productConverter::toDto)
                .toList();
    }
}
