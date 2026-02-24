package org.testautomation.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testautomation.entity.Category;
import org.testautomation.entity.Product;
import org.testautomation.repository.CategoryRepository;
import org.testautomation.repository.ProductRepository;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserAddressRepository;
import org.testautomation.repository.UserCartItemRepository;
import org.testautomation.repository.UserOrderRepository;
import org.testautomation.repository.UserPaymentMethodRepository;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CheckoutIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserOrderRepository userOrderRepository;

    @Autowired
    private UserCartItemRepository userCartItemRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserPaymentMethodRepository userPaymentMethodRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void cleanData() {
        userOrderRepository.deleteAll();
        userCartItemRepository.deleteAll();
        userAddressRepository.deleteAll();
        userPaymentMethodRepository.deleteAll();
        userAccountRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
    }

    @Test
    void checkoutCreatesOrderClearsCartAndPersistsSavedPreferences() throws Exception {
        Category category = categoryRepository.save(new Category("Integration", "Integration category"));
        Product product = productRepository.save(new Product("Integration Keyboard", "End-to-end product", new BigDecimal("99.90"), category));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Checkout User",
                                  "email": "integration.checkout@example.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isOk());

        MockHttpSession session = signInAs("integration.checkout@example.com", "secret123");

        mockMvc.perform(put("/api/cart")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [{"productId": %d, "quantity": 2}]
                                """.formatted(product.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        mockMvc.perform(post("/api/checkout")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "shipping": {
                                    "fullName": "Checkout User",
                                    "email": "integration.checkout@example.com",
                                    "address": "Main Street 1",
                                    "city": "Oslo",
                                    "postalCode": "0150",
                                    "country": "Norway"
                                  },
                                  "payment": {
                                    "method": "card",
                                    "cardNumber": "4111111111111111",
                                    "cardExpiry": "01/30",
                                    "cardCvc": "123"
                                  },
                                  "saveShippingAddress": true,
                                  "shippingAddressLabel": "Home",
                                  "savePaymentMethod": true,
                                  "paymentMethodLabel": "Primary Card",
                                  "items": [{"productId": %d, "quantity": 2, "unitPrice": 99.90}],
                                  "subtotal": 199.80,
                                  "currency": "USD"
                                }
                                """.formatted(product.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", startsWith("ORD-")))
                .andExpect(jsonPath("$.status").value("accepted"));

        mockMvc.perform(get("/api/cart").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));

        mockMvc.perform(get("/api/orders").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].currency").value("USD"))
                .andExpect(jsonPath("$[0].items.length()").value(1));

        mockMvc.perform(get("/api/profile/addresses").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].label").value("Home"))
                .andExpect(jsonPath("$[0].default").value(true));

        mockMvc.perform(get("/api/profile/payment-methods").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].label").value("Primary Card"))
                .andExpect(jsonPath("$[0].cardLast4").value("1111"))
                .andExpect(jsonPath("$[0].default").value(true));
    }

    private MockHttpSession signInAs(String email, String password) throws Exception {
        String signInJson = """
                {
                  "email": "%s",
                  "password": "%s",
                  "rememberMe": true
                }
                """.formatted(email, password);

        MvcResult signInResult = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signInJson))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) signInResult.getRequest().getSession(false);
    }
}
