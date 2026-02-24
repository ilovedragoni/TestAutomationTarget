package org.testautomation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.testautomation.domain.AuthUserDTO;
import org.testautomation.domain.UserAccountDeleteRequest;
import org.testautomation.domain.UserAccountUpdateRequest;
import org.testautomation.domain.UserAddressRequest;
import org.testautomation.domain.UserAddressResponse;
import org.testautomation.domain.UserPasswordUpdateRequest;
import org.testautomation.domain.UserPaymentMethodRequest;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserAddress;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserAddressRepository;
import org.testautomation.repository.UserPaymentMethodRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;
    @Mock
    private UserAddressRepository userAddressRepository;
    @Mock
    private UserPaymentMethodRepository userPaymentMethodRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileService profileService;

    @Test
    void updateAccountThrowsWhenNewEmailAlreadyExists() {
        UserAccount user = user(1L, "existing@example.com");
        UserAccountUpdateRequest request = new UserAccountUpdateRequest();
        request.setName("New Name");
        request.setEmail("taken@example.com");

        when(userAccountRepository.findByEmailIgnoreCase("existing@example.com")).thenReturn(Optional.of(user));
        when(userAccountRepository.existsByEmailIgnoreCase("taken@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> profileService.updateAccount("existing@example.com", request));
        assertThat(exception.getMessage()).isEqualTo("Email is already in use");
    }

    @Test
    void updateAccountNormalizesNameAndEmail() {
        UserAccount user = user(2L, "user@example.com");
        UserAccountUpdateRequest request = new UserAccountUpdateRequest();
        request.setName("  Jane Doe ");
        request.setEmail("  JANE@EXAMPLE.COM ");

        when(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthUserDTO dto = profileService.updateAccount("user@example.com", request);

        assertThat(dto.getName()).isEqualTo("Jane Doe");
        assertThat(dto.getEmail()).isEqualTo("jane@example.com");
    }

    @Test
    void updatePasswordThrowsWhenCurrentPasswordDoesNotMatch() {
        UserAccount user = user(3L, "password@example.com");
        user.setPasswordHash("stored-hash");
        UserPasswordUpdateRequest request = new UserPasswordUpdateRequest();
        request.setCurrentPassword("wrong");
        request.setNewPassword("new-password");

        when(userAccountRepository.findByEmailIgnoreCase("password@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "stored-hash")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> profileService.updatePassword("password@example.com", request));
        assertThat(exception.getMessage()).isEqualTo("Current password is incorrect");
    }

    @Test
    void updatePasswordThrowsWhenNewPasswordEqualsCurrent() {
        UserAccount user = user(4L, "same@example.com");
        user.setPasswordHash("stored-hash");
        UserPasswordUpdateRequest request = new UserPasswordUpdateRequest();
        request.setCurrentPassword("current123");
        request.setNewPassword("current123");

        when(userAccountRepository.findByEmailIgnoreCase("same@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current123", "stored-hash")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> profileService.updatePassword("same@example.com", request));
        assertThat(exception.getMessage()).isEqualTo("New password must be different from current password");
    }

    @Test
    void addAddressSetsDefaultWhenUsersFirstAddress() {
        UserAccount user = user(5L, "address@example.com");
        UserAddressRequest request = new UserAddressRequest();
        request.setLabel("Home");
        request.setFullName("John Doe");
        request.setEmail("JOHN@EXAMPLE.COM");
        request.setAddress("Street 1");
        request.setCity("City");
        request.setPostalCode("12345");
        request.setCountry("Country");
        request.setDefault(false);

        when(userAccountRepository.findByEmailIgnoreCase("address@example.com")).thenReturn(Optional.of(user));
        when(userAddressRepository.findByUserIdOrderByCreatedAtDesc(5L)).thenReturn(List.of());
        when(userAddressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> {
            UserAddress address = invocation.getArgument(0);
            address.setId(1L);
            return address;
        });

        UserAddressResponse response = profileService.addAddress("address@example.com", request);

        assertThat(response.isDefault()).isTrue();
        assertThat(response.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void deleteAddressPromotesMostRecentWhenDeletedAddressWasDefault() {
        UserAccount user = user(6L, "delete.address@example.com");
        UserAddress deleted = new UserAddress();
        deleted.setId(9L);
        deleted.setUser(user);
        deleted.setDefault(true);

        UserAddress promoted = new UserAddress();
        promoted.setId(10L);
        promoted.setUser(user);
        promoted.setDefault(false);

        when(userAccountRepository.findByEmailIgnoreCase("delete.address@example.com")).thenReturn(Optional.of(user));
        when(userAddressRepository.findByIdAndUserId(9L, 6L)).thenReturn(Optional.of(deleted));
        when(userAddressRepository.findByUserIdOrderByCreatedAtDesc(6L)).thenReturn(List.of(promoted));

        profileService.deleteAddress("delete.address@example.com", 9L);

        assertThat(promoted.isDefault()).isTrue();
        verify(userAddressRepository).save(promoted);
    }

    @Test
    void addPaymentMethodThrowsWhenCardIsMissingLast4() {
        UserAccount user = user(7L, "payment@example.com");
        UserPaymentMethodRequest request = new UserPaymentMethodRequest();
        request.setLabel("Primary");
        request.setMethod("card");
        request.setCardLast4(" ");
        request.setCardExpiry("01/30");

        when(userAccountRepository.findByEmailIgnoreCase("payment@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> profileService.addPaymentMethod("payment@example.com", request));
        assertThat(exception.getMessage()).isEqualTo("cardLast4 is required for card payment methods");
    }

    @Test
    void deleteAccountDeletesUserWhenPasswordMatches() {
        UserAccount user = user(8L, "delete@example.com");
        user.setPasswordHash("stored-hash");
        UserAccountDeleteRequest request = new UserAccountDeleteRequest();
        request.setCurrentPassword("secret");

        when(userAccountRepository.findByEmailIgnoreCase("delete@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "stored-hash")).thenReturn(true);

        profileService.deleteAccount("delete@example.com", request);

        verify(userAccountRepository).delete(user);
    }

    private UserAccount user(Long id, String email) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setEmail(email);
        user.setDisplayName("User");
        user.setPasswordHash("hash");
        user.setEnabled(true);
        return user;
    }
}
