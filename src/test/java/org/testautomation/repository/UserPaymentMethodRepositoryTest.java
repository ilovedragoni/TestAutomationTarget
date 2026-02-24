package org.testautomation.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserPaymentMethod;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserPaymentMethodRepositoryTest {

    @Autowired
    private UserPaymentMethodRepository userPaymentMethodRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Test
    void findByUserIdOrderByCreatedAtDescReturnsOnlyUsersMethodsInDescendingOrder() {
        UserAccount owner = createUser("owner.payments@example.com");
        UserAccount other = createUser("other.payments@example.com");

        UserPaymentMethod older = createCard(owner, "Primary", "1234", "01/29", Instant.parse("2025-01-01T00:00:00Z"));
        UserPaymentMethod newer = createPaypal(owner, "PayPal", "owner.paypal@example.com", Instant.parse("2025-02-01T00:00:00Z"));
        createCard(other, "Other", "9999", "12/30", Instant.parse("2025-03-01T00:00:00Z"));

        List<UserPaymentMethod> methods = userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(owner.getId());

        assertThat(methods).extracting(UserPaymentMethod::getId).containsExactly(newer.getId(), older.getId());
        assertThat(methods).allMatch(method -> method.getUser().getId().equals(owner.getId()));
    }

    @Test
    void findByIdAndUserIdReturnsMatchOnlyForOwner() {
        UserAccount owner = createUser("owner.payment.lookup@example.com");
        UserAccount other = createUser("other.payment.lookup@example.com");
        UserPaymentMethod method = createCard(owner, "Card", "1111", "04/30", Instant.parse("2025-01-10T00:00:00Z"));

        assertThat(userPaymentMethodRepository.findByIdAndUserId(method.getId(), owner.getId())).isPresent();
        assertThat(userPaymentMethodRepository.findByIdAndUserId(method.getId(), other.getId())).isEmpty();
    }

    private UserAccount createUser(String email) {
        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setDisplayName(email);
        user.setEnabled(true);
        return userAccountRepository.save(user);
    }

    private UserPaymentMethod createCard(UserAccount user, String label, String cardLast4, String cardExpiry, Instant createdAt) {
        UserPaymentMethod method = new UserPaymentMethod();
        method.setUser(user);
        method.setLabel(label);
        method.setMethod("card");
        method.setCardLast4(cardLast4);
        method.setCardExpiry(cardExpiry);
        method.setPaypalEmail(null);
        method.setDefault(false);
        method.setCreatedAt(createdAt);
        return userPaymentMethodRepository.save(method);
    }

    private UserPaymentMethod createPaypal(UserAccount user, String label, String paypalEmail, Instant createdAt) {
        UserPaymentMethod method = new UserPaymentMethod();
        method.setUser(user);
        method.setLabel(label);
        method.setMethod("paypal");
        method.setCardLast4(null);
        method.setCardExpiry(null);
        method.setPaypalEmail(paypalEmail);
        method.setDefault(false);
        method.setCreatedAt(createdAt);
        return userPaymentMethodRepository.save(method);
    }
}
