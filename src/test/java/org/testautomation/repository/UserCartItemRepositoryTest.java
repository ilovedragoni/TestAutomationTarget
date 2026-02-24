package org.testautomation.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.testautomation.entity.Category;
import org.testautomation.entity.Product;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserCartItem;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@ActiveProfiles("test")
class UserCartItemRepositoryTest {

    @Autowired
    private UserCartItemRepository userCartItemRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void findByUserIdReturnsOnlyItemsOwnedByUser() {
        UserAccount owner = createUser("owner.cart@example.com");
        UserAccount other = createUser("other.cart@example.com");
        Product productA = createProduct("Keyboard");
        Product productB = createProduct("Mouse");

        createCartItem(owner, productA, 2);
        createCartItem(owner, productB, 1);
        createCartItem(other, productA, 5);

        List<UserCartItem> items = userCartItemRepository.findByUserId(owner.getId());

        assertThat(items).hasSize(2);
        assertThat(items).allMatch(item -> item.getUser().getId().equals(owner.getId()));
    }

    @Test
    void deleteByUserIdRemovesOnlyTargetsUsersItems() {
        UserAccount owner = createUser("delete.owner.cart@example.com");
        UserAccount other = createUser("delete.other.cart@example.com");
        Product product = createProduct("Headset");

        createCartItem(owner, product, 1);
        createCartItem(other, product, 3);

        userCartItemRepository.deleteByUserId(owner.getId());

        assertThat(userCartItemRepository.findByUserId(owner.getId())).isEmpty();
        assertThat(userCartItemRepository.findByUserId(other.getId())).hasSize(1);
    }

    @Test
    void userAndProductCombinationMustBeUnique() {
        UserAccount owner = createUser("unique.cart@example.com");
        Product product = createProduct("Monitor");

        createCartItem(owner, product, 1);

        UserCartItem duplicate = new UserCartItem();
        duplicate.setUser(owner);
        duplicate.setProduct(product);
        duplicate.setQuantity(2);

        assertThrows(DataIntegrityViolationException.class, () -> userCartItemRepository.saveAndFlush(duplicate));
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
        Category category = categoryRepository.save(new Category("Cart Category " + name, "desc"));
        return productRepository.save(new Product(name, "desc", new BigDecimal("10.00"), category));
    }

    private UserCartItem createCartItem(UserAccount user, Product product, int quantity) {
        UserCartItem item = new UserCartItem();
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(quantity);
        return userCartItemRepository.save(item);
    }
}
