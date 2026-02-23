package org.testautomation.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.converter.ProductConverter;
import org.testautomation.domain.ProductDTO;
import org.testautomation.domain.ProductPageResponse;
import org.testautomation.entity.Product;
import org.testautomation.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductConverter productConverter;

    public ProductService(ProductRepository productRepository, ProductConverter productConverter) {
        this.productRepository = productRepository;
        this.productConverter = productConverter;
    }

    @Transactional(readOnly = true)
    public ProductPageResponse findAll(String name, Long categoryId, int page, int size) {
        final Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        final Page<Product> productsPage;

        if (categoryId != null && name != null && !name.isBlank()) {
            productsPage = productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, name.trim(), pageable);
        } else if (categoryId != null) {
            productsPage = productRepository.findByCategoryId(categoryId, pageable);
        } else if (name != null && !name.isBlank()) {
            productsPage = productRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
        } else {
            productsPage = productRepository.findAll(pageable);
        }

        List<ProductDTO> items = productsPage.getContent().stream()
                .map(productConverter::toDto)
                .toList();

        return new ProductPageResponse(
                items,
                productsPage.getNumber(),
                productsPage.getSize(),
                productsPage.getTotalElements(),
                productsPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public Optional<ProductDTO> findById(Long id) {
        return productRepository.findById(id)
                .map(productConverter::toDto);
    }
}
