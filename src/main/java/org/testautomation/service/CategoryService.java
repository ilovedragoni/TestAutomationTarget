package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.converter.CategoryConverter;
import org.testautomation.entity.Category;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryConverter categoryConverter;

    public CategoryService(CategoryRepository categoryRepository, CategoryConverter categoryConverter) {
        this.categoryRepository = categoryRepository;
        this.categoryConverter = categoryConverter;
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> findAll() {
        final List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(categoryConverter::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CategoryDTO> findById(Long id) {
        return categoryRepository.findById(id)
                .map(categoryConverter::toDto);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> searchByName(String name) {
        final List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name.trim());
        return categories.stream()
                .map(categoryConverter::toDto)
                .toList();
    }
}
