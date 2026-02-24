package org.testautomation.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserAddress;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserAddressRepositoryTest {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Test
    void findByUserIdOrderByCreatedAtDescReturnsOnlyUsersAddressesInDescendingOrder() {
        UserAccount owner = createUser("owner.addresses@example.com");
        UserAccount other = createUser("other.addresses@example.com");

        UserAddress older = createAddress(owner, "Home", Instant.parse("2025-01-01T00:00:00Z"));
        UserAddress newer = createAddress(owner, "Work", Instant.parse("2025-02-01T00:00:00Z"));
        createAddress(other, "Other", Instant.parse("2025-03-01T00:00:00Z"));

        List<UserAddress> addresses = userAddressRepository.findByUserIdOrderByCreatedAtDesc(owner.getId());

        assertThat(addresses).extracting(UserAddress::getId).containsExactly(newer.getId(), older.getId());
        assertThat(addresses).allMatch(address -> address.getUser().getId().equals(owner.getId()));
    }

    @Test
    void findByIdAndUserIdReturnsMatchOnlyForOwner() {
        UserAccount owner = createUser("owner.lookup@example.com");
        UserAccount other = createUser("other.lookup@example.com");
        UserAddress address = createAddress(owner, "Billing", Instant.parse("2025-01-10T00:00:00Z"));

        assertThat(userAddressRepository.findByIdAndUserId(address.getId(), owner.getId())).isPresent();
        assertThat(userAddressRepository.findByIdAndUserId(address.getId(), other.getId())).isEmpty();
    }

    private UserAccount createUser(String email) {
        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setDisplayName(email);
        user.setEnabled(true);
        return userAccountRepository.save(user);
    }

    private UserAddress createAddress(UserAccount user, String label, Instant createdAt) {
        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setLabel(label);
        address.setFullName("Full Name");
        address.setEmail(user.getEmail());
        address.setAddress("Main Street 1");
        address.setCity("Test City");
        address.setPostalCode("12345");
        address.setCountry("Test Country");
        address.setDefault(false);
        address.setCreatedAt(createdAt);
        return userAddressRepository.save(address);
    }
}
