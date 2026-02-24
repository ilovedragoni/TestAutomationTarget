package org.testautomation.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.testautomation.domain.ProductDTO;
import org.testautomation.domain.ProductPageResponse;
import org.testautomation.service.ProductService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class ProductRestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    void listSanitizesPageAndSizeBeforeDelegating() throws Exception {
        when(productService.findAll(null, null, 0, 100))
                .thenReturn(new ProductPageResponse(List.of(), 0, 100, 0, 0));

        mockMvc.perform(get("/api/products?page=-3&size=999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(100));

        verify(productService).findAll(null, null, 0, 100);
    }

    @Test
    void getReturnsNotFoundWhenProductMissing() throws Exception {
        when(productService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getReturnsProductWhenFound() throws Exception {
        when(productService.findById(10L))
                .thenReturn(Optional.of(new ProductDTO(10L, "Keyboard", "desc", new BigDecimal("99.90"), null)));

        mockMvc.perform(get("/api/products/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Keyboard"));
    }
}
