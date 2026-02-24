package org.testautomation.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.testautomation.domain.CartResponse;
import org.testautomation.service.CartService;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CartRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class CartRestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @Test
    void getCartReturnsResponseForAuthenticatedUser() throws Exception {
        when(cartService.getCart("user@example.com")).thenReturn(new CartResponse(List.of()));

        mockMvc.perform(get("/api/cart")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk());
    }

    @Test
    void replaceCartReturnsBadRequestForInvalidPayload() throws Exception {
        mockMvc.perform(put("/api/cart")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                .content("""
                                [{"productId":1,"quantity":0}]
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason("Validation failure"));
    }

    @Test
    void clearCartReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/cart")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isNoContent());

        verify(cartService).clearCart("user@example.com");
    }
}
