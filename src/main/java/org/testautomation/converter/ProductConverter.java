package org.testautomation.converter;

import org.springframework.stereotype.Component;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.domain.ProductDTO;
import org.testautomation.entity.Product;

@Component
public class ProductConverter implements Converter<Product, ProductDTO>{

    private final CategoryConverter categoryConverter;

    public ProductConverter(CategoryConverter categoryConverter) {
        this.categoryConverter = categoryConverter;
    }

    @Override
    public ProductDTO toDto(Product entity) {
        final CategoryDTO category = categoryConverter.toDto(entity.getCategory());
        return new ProductDTO(entity.getId(), entity.getName(), entity.getDescription(), entity.getPrice(), category);
    }

    @Override
    public Product toEntity(ProductDTO dto) {
        return new Product(dto.getName(), dto.getDescription(), dto.getPrice());
    }
}
