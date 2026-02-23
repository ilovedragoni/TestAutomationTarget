package org.testautomation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.testautomation.domain.ProductDTO;
import org.testautomation.domain.ProductPageResponse;
import org.testautomation.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductRestController {

    private final ProductService productService;

    public ProductRestController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ProductPageResponse list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        final int safePage = Math.max(0, page);
        final int safeSize = Math.max(1, Math.min(size, 100));
        return productService.findAll(search, categoryId, safePage, safeSize);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> get(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
