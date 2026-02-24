package org.testautomation.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceUnitUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.testautomation.entity.Category;
import org.testautomation.entity.Product;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserOrder;
import org.testautomation.entity.UserOrderItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserOrderRepositoryTest {

    @Autowired
    private UserOrderRepository userOrderRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void findByUserIdOrderByCreatedAtDescReturnsOnlyUsersOrdersAndLoadsItemsAndProducts() {
        UserAccount owner = createUser("orders.owner@example.com");
        UserAccount other = createUser("orders.other@example.com");
        Product product = createProduct("Laptop");

        UserOrder older = createOrder(owner, product, "accepted", Instant.parse("2025-01-01T00:00:00Z"));
        UserOrder newer = createOrder(owner, product, "pending", Instant.parse("2025-02-01T00:00:00Z"));
        createOrder(other, product, "accepted", Instant.parse("2025-03-01T00:00:00Z"));

        entityManager.flush();
        entityManager.clear();

        List<UserOrder> orders = userOrderRepository.findByUserIdOrderByCreatedAtDesc(owner.getId());

        assertThat(orders).extracting(UserOrder::getId).containsExactly(newer.getId(), older.getId());
        assertThat(orders).allMatch(order -> order.getUser().getId().equals(owner.getId()));

        PersistenceUnitUtil util = entityManager.getEntityManagerFactory().getPersistenceUnitUtil();
        UserOrder firstOrder = orders.get(0);
        assertThat(util.isLoaded(firstOrder, "items")).isTrue();
        assertThat(firstOrder.getItems()).isNotEmpty();
        assertThat(util.isLoaded(firstOrder.getItems().get(0), "product")).isTrue();
        assertThat(firstOrder.getItems().get(0).getProduct().getName()).isEqualTo("Laptop");
    }

    private UserAccount createUser(String email) {
        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setDisplayName(email);
        user.setEnabled(true);
        return userAccountRepository.save(user);
    }

    private Product createProduct(String name) {
        Category category = categoryRepository.save(new Category("Orders Category " + name, "desc"));
        return productRepository.save(new Product(name, "desc", new BigDecimal("1000.00"), category));
    }

    private UserOrder createOrder(UserAccount user, Product product, String status, Instant createdAt) {
        UserOrder order = new UserOrder();
        order.setUser(user);
        order.setStatus(status);
        order.setCurrency("USD");
        order.setSubtotal(new BigDecimal("1000.00"));
        order.setShippingFullName("John Doe");
        order.setShippingEmail(user.getEmail());
        order.setShippingAddress("Street 1");
        order.setShippingCity("City");
        order.setShippingPostalCode("12345");
        order.setShippingCountry("Country");
        order.setPaymentMethod("card");
        order.setPaymentCardLast4("1111");
        order.setPaymentCardExpiry("12/30");
        order.setCreatedAt(createdAt);

        UserOrderItem item = new UserOrderItem();
        item.setProduct(product);
        item.setProductName(product.getName());
        item.setUnitPrice(new BigDecimal("1000.00"));
        item.setQuantity(1);
        item.setLineTotal(new BigDecimal("1000.00"));
        order.addItem(item);

        return userOrderRepository.save(order);
    }
}
