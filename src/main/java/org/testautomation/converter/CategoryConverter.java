package org.testautomation.converter;

import org.springframework.stereotype.Component;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.entity.Category;

@Component
public class CategoryConverter implements Converter<Category, CategoryDTO>{

    @Override
    public CategoryDTO toDto(Category entity) {
        return new CategoryDTO(entity.getId(), entity.getName(), entity.getDescription());
    }

    @Override
    public Category toEntity(CategoryDTO dto) {
        return new Category(dto.getName(), dto.getDescription());
    }
}
