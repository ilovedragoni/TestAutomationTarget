package org.testautomation.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.testautomation.entity.UserAccount;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserAccountRepositoryTest {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Test
    void findByEmailIgnoreCaseReturnsUserWhenEmailCaseDiffers() {
        UserAccount user = new UserAccount();
        user.setEmail("mixed.case@example.com");
        user.setPasswordHash("hash");
        user.setDisplayName("Mixed Case");
        user.setEnabled(true);
        userAccountRepository.save(user);

        assertThat(userAccountRepository.findByEmailIgnoreCase("MIXED.CASE@EXAMPLE.COM"))
                .isPresent()
                .get()
                .extracting(UserAccount::getDisplayName)
                .isEqualTo("Mixed Case");
    }

    @Test
    void existsByEmailIgnoreCaseReturnsExpectedValues() {
        UserAccount user = new UserAccount();
        user.setEmail("exists@example.com");
        user.setPasswordHash("hash");
        user.setDisplayName("Exists");
        user.setEnabled(true);
        userAccountRepository.save(user);

        assertThat(userAccountRepository.existsByEmailIgnoreCase("EXISTS@example.com")).isTrue();
        assertThat(userAccountRepository.existsByEmailIgnoreCase("missing@example.com")).isFalse();
    }
}
