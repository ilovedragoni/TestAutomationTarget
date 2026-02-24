package org.testautomation.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.service.CategoryService;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CategoryRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class CategoryRestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Test
    void listUsesSearchWhenProvided() throws Exception {
        when(categoryService.searchByName("office"))
                .thenReturn(List.of(new CategoryDTO(1L, "Office", "desc")));

        mockMvc.perform(get("/api/categories?search=office"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Office"));

        verify(categoryService).searchByName("office");
    }

    @Test
    void listUsesFindAllWhenSearchMissing() throws Exception {
        when(categoryService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());

        verify(categoryService).findAll();
    }

    @Test
    void getReturnsNotFoundWhenMissing() throws Exception {
        when(categoryService.findById(55L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/categories/55"))
                .andExpect(status().isNotFound());
    }
}
