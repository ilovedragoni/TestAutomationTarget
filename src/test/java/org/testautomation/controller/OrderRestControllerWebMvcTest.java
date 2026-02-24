package org.testautomation.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.testautomation.domain.OrderSummaryResponse;
import org.testautomation.service.OrderService;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class OrderRestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void getOrdersReturnsOrderSummaries() throws Exception {
        when(orderService.getOrders("user@example.com"))
                .thenReturn(List.of(
                        new OrderSummaryResponse("ORD-10", "accepted", "2026-02-24T10:15:30", "USD", new BigDecimal("19.99"), List.of())
                ));

        mockMvc.perform(get("/api/orders")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderId").value("ORD-10"))
                .andExpect(jsonPath("$[0].status").value("accepted"));
    }

    @Test
    void getOrdersReturnsBadRequestWhenServiceThrowsIllegalArgument() throws Exception {
        when(orderService.getOrders("user@example.com")).thenThrow(new IllegalArgumentException("User not found"));

        mockMvc.perform(get("/api/orders")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User not found"));
    }
}
