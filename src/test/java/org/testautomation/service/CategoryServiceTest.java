package org.testautomation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.testautomation.converter.CategoryConverter;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.entity.Category;
import org.testautomation.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryConverter categoryConverter;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void findAllMapsCategoriesToDtos() {
        Category category = new Category("Input", "desc");
        category.setId(1L);
        CategoryDTO dto = new CategoryDTO(1L, "Input", "desc");

        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(categoryConverter.toDto(category)).thenReturn(dto);

        List<CategoryDTO> result = categoryService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Input");
    }

    @Test
    void searchByNameTrimsInputBeforeRepositoryCall() {
        Category category = new Category("Office", "desc");
        category.setId(2L);
        CategoryDTO dto = new CategoryDTO(2L, "Office", "desc");

        when(categoryRepository.findByNameContainingIgnoreCase("office")).thenReturn(List.of(category));
        when(categoryConverter.toDto(category)).thenReturn(dto);

        List<CategoryDTO> result = categoryService.searchByName("  office  ");

        assertThat(result).hasSize(1);
        verify(categoryRepository).findByNameContainingIgnoreCase("office");
    }

    @Test
    void findByIdReturnsEmptyWhenCategoryMissing() {
        when(categoryRepository.findById(10L)).thenReturn(Optional.empty());
        assertThat(categoryService.findById(10L)).isEmpty();
    }
}
