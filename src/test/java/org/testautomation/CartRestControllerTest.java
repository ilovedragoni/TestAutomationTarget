package org.testautomation;

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
import org.testautomation.repository.UserCartItemRepository;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CartRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserCartItemRepository userCartItemRepository;

    private Long productIdA;
    private Long productIdB;

    @BeforeEach
    void setUpData() {
        userCartItemRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        Category category = categoryRepository.save(new Category("Cart Tests", "Category for cart integration tests"));
        Product productA = productRepository.save(new Product("Keyboard", "Mechanical keyboard", new BigDecimal("99.90"), category));
        Product productB = productRepository.save(new Product("Mouse", "Gaming mouse", new BigDecimal("49.90"), category));

        productIdA = productA.getId();
        productIdB = productB.getId();
    }

    @Test
    void getCartRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isForbidden());
    }

    @Test
    void replaceMergeAndClearCartFlow() throws Exception {
        MockHttpSession session = signInAs("cart.user@example.com", "secret123");

        String replacePayload = """
                [
                  {"productId": %d, "quantity": 2}
                ]
                """.formatted(productIdA);

        mockMvc.perform(put("/api/cart")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(replacePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].product.id").value(productIdA))
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        String mergePayload = """
                [
                  {"productId": %d, "quantity": 1},
                  {"productId": %d, "quantity": 3}
                ]
                """.formatted(productIdA, productIdB);

        mockMvc.perform(post("/api/cart/merge")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mergePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));

        mockMvc.perform(get("/api/cart").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[*].quantity", hasItems(3, 3)));

        mockMvc.perform(delete("/api/cart").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/cart").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    private MockHttpSession signInAs(String email, String password) throws Exception {
        String signUpJson = """
                {
                  "name": "Cart User",
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpJson))
                .andExpect(status().isOk());

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
