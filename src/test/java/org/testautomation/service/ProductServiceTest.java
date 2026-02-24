package org.testautomation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.testautomation.converter.ProductConverter;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.domain.ProductDTO;
import org.testautomation.domain.ProductPageResponse;
import org.testautomation.entity.Product;
import org.testautomation.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductConverter productConverter;

    @InjectMocks
    private ProductService productService;

    @Test
    void findAllUsesCategoryAndSearchWhenBothProvided() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Keyboard");
        ProductDTO dto = new ProductDTO(1L, "Keyboard", "desc", new BigDecimal("99.90"), new CategoryDTO(3L, "Input", "desc"));

        when(productRepository.findByCategoryIdAndNameContainingIgnoreCase(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(product), PageRequest.of(0, 10), 1));
        when(productConverter.toDto(product)).thenReturn(dto);

        ProductPageResponse response = productService.findAll("  key  ", 3L, 0, 10);

        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getName()).isEqualTo("Keyboard");
        verify(productRepository).findByCategoryIdAndNameContainingIgnoreCase(3L, "key", PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("id").ascending()));
    }

    @Test
    void findAllUsesFindAllWhenNoFiltersProvided() {
        when(productRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(1, 5), 0));

        ProductPageResponse response = productService.findAll(null, null, 1, 5);

        assertThat(response.getItems()).isEmpty();
        assertThat(response.getPage()).isEqualTo(1);
        assertThat(response.getSize()).isEqualTo(5);
    }

    @Test
    void findByIdMapsToDtoWhenPresent() {
        Product product = new Product();
        product.setId(20L);
        ProductDTO dto = new ProductDTO(20L, "Monitor", "desc", new BigDecimal("199.90"), null);

        when(productRepository.findById(20L)).thenReturn(Optional.of(product));
        when(productConverter.toDto(product)).thenReturn(dto);

        Optional<ProductDTO> response = productService.findById(20L);
        assertThat(response).isPresent();
        assertThat(response.get().getName()).isEqualTo("Monitor");
    }
}
