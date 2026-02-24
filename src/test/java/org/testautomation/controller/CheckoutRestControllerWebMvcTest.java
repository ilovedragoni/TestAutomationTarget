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
import org.testautomation.domain.CheckoutResponse;
import org.testautomation.service.CheckoutService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CheckoutRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class CheckoutRestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CheckoutService checkoutService;

    @Test
    void checkoutReturnsResponseWhenPayloadIsValid() throws Exception {
        when(checkoutService.checkout(any(), any())).thenReturn(new CheckoutResponse("ORD-10", "accepted", "Order placed successfully."));

        mockMvc.perform(post("/api/checkout")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "shipping":{"fullName":"John Doe","email":"john@example.com","address":"Street 1","city":"City","postalCode":"12345","country":"Country"},
                                  "payment":{"method":"card","cardNumber":"4111111111111111","cardExpiry":"01/30","cardCvc":"123"},
                                  "items":[{"productId":1,"quantity":1,"unitPrice":10.00}],
                                  "subtotal":10.00,
                                  "currency":"USD"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("ORD-10"));
    }

    @Test
    void checkoutReturnsBadRequestForInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/checkout")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"items":[],"subtotal":1.00,"currency":"USD"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("items must not be empty"));
    }
}
