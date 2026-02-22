package org.testautomation.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.testautomation.domain.ProductDTO;
import org.testautomation.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductRestController {

    private final ProductService productService;

    public ProductRestController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDTO> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId
    ) {
        if (categoryId != null || (search != null && !search.isBlank())) {
            if (categoryId != null) {
                return productService.search(search, categoryId);
            } else {
                return productService.searchByName(search);
            }
        } else {
            return productService.findAll();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> get(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
