package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.domain.UserAddressRequest;
import org.testautomation.domain.UserAddressResponse;
import org.testautomation.domain.UserPaymentMethodRequest;
import org.testautomation.domain.UserPaymentMethodResponse;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserAddress;
import org.testautomation.entity.UserPaymentMethod;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserAddressRepository;
import org.testautomation.repository.UserPaymentMethodRepository;

import java.util.List;
import java.util.Locale;

@Service
public class ProfileService {

    private final UserAccountRepository userAccountRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserPaymentMethodRepository userPaymentMethodRepository;

    public ProfileService(
            UserAccountRepository userAccountRepository,
            UserAddressRepository userAddressRepository,
            UserPaymentMethodRepository userPaymentMethodRepository
    ) {
        this.userAccountRepository = userAccountRepository;
        this.userAddressRepository = userAddressRepository;
        this.userPaymentMethodRepository = userPaymentMethodRepository;
    }

    @Transactional(readOnly = true)
    public List<UserAddressResponse> getAddresses(String email) {
        UserAccount user = getUserByEmail(email);
        return userAddressRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toAddressResponse)
                .toList();
    }

    @Transactional
    public UserAddressResponse addAddress(String email, UserAddressRequest request) {
        UserAccount user = getUserByEmail(email);
        UserAddress address = new UserAddress();
        address.setUser(user);
        applyAddressRequest(address, request);

        if (request.isDefault()) {
            clearDefaultAddresses(user.getId());
        } else if (userAddressRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).isEmpty()) {
            address.setDefault(true);
        }

        return toAddressResponse(userAddressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        UserAccount user = getUserByEmail(email);
        UserAddress address = userAddressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        boolean wasDefault = address.isDefault();
        userAddressRepository.delete(address);

        if (wasDefault) {
            userAddressRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                    .findFirst()
                    .ifPresent(first -> {
                        first.setDefault(true);
                        userAddressRepository.save(first);
                    });
        }
    }

    @Transactional
    public UserAddressResponse setDefaultAddress(String email, Long addressId) {
        UserAccount user = getUserByEmail(email);
        UserAddress address = userAddressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        clearDefaultAddresses(user.getId());
        address.setDefault(true);
        return toAddressResponse(userAddressRepository.save(address));
    }

    @Transactional(readOnly = true)
    public List<UserPaymentMethodResponse> getPaymentMethods(String email) {
        UserAccount user = getUserByEmail(email);
        return userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toPaymentMethodResponse)
                .toList();
    }

    @Transactional
    public UserPaymentMethodResponse addPaymentMethod(String email, UserPaymentMethodRequest request) {
        UserAccount user = getUserByEmail(email);
        UserPaymentMethod paymentMethod = new UserPaymentMethod();
        paymentMethod.setUser(user);
        applyPaymentMethodRequest(paymentMethod, request);

        if (request.isDefault()) {
            clearDefaultPaymentMethods(user.getId());
        } else if (userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).isEmpty()) {
            paymentMethod.setDefault(true);
        }

        return toPaymentMethodResponse(userPaymentMethodRepository.save(paymentMethod));
    }

    @Transactional
    public void deletePaymentMethod(String email, Long paymentMethodId) {
        UserAccount user = getUserByEmail(email);
        UserPaymentMethod paymentMethod = userPaymentMethodRepository.findByIdAndUserId(paymentMethodId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        boolean wasDefault = paymentMethod.isDefault();
        userPaymentMethodRepository.delete(paymentMethod);

        if (wasDefault) {
            userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                    .findFirst()
                    .ifPresent(first -> {
                        first.setDefault(true);
                        userPaymentMethodRepository.save(first);
                    });
        }
    }

    @Transactional
    public UserPaymentMethodResponse setDefaultPaymentMethod(String email, Long paymentMethodId) {
        UserAccount user = getUserByEmail(email);
        UserPaymentMethod paymentMethod = userPaymentMethodRepository.findByIdAndUserId(paymentMethodId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        clearDefaultPaymentMethods(user.getId());
        paymentMethod.setDefault(true);
        return toPaymentMethodResponse(userPaymentMethodRepository.save(paymentMethod));
    }

    private void applyAddressRequest(UserAddress address, UserAddressRequest request) {
        address.setLabel(request.getLabel().trim());
        address.setFullName(request.getFullName().trim());
        address.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        address.setAddress(request.getAddress().trim());
        address.setCity(request.getCity().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());
        address.setDefault(request.isDefault());
    }

    private void applyPaymentMethodRequest(UserPaymentMethod paymentMethod, UserPaymentMethodRequest request) {
        String method = normalizeMethod(request.getMethod());
        paymentMethod.setLabel(request.getLabel().trim());
        paymentMethod.setMethod(method);
        paymentMethod.setDefault(request.isDefault());

        if ("card".equals(method)) {
            if (request.getCardLast4() == null || request.getCardLast4().isBlank()) {
                throw new IllegalArgumentException("cardLast4 is required for card payment methods");
            }
            if (request.getCardExpiry() == null || request.getCardExpiry().isBlank()) {
                throw new IllegalArgumentException("cardExpiry is required for card payment methods");
            }
            paymentMethod.setCardLast4(request.getCardLast4().trim());
            paymentMethod.setCardExpiry(request.getCardExpiry().trim());
            paymentMethod.setPaypalEmail(null);
            return;
        }

        if ("paypal".equals(method)) {
            if (request.getPaypalEmail() == null || request.getPaypalEmail().isBlank()) {
                throw new IllegalArgumentException("paypalEmail is required for paypal payment methods");
            }
            paymentMethod.setPaypalEmail(request.getPaypalEmail().trim().toLowerCase(Locale.ROOT));
            paymentMethod.setCardLast4(null);
            paymentMethod.setCardExpiry(null);
            return;
        }

        throw new IllegalArgumentException("Unsupported payment method: " + method);
    }

    private String normalizeMethod(String method) {
        if (method == null) {
            throw new IllegalArgumentException("method is required");
        }
        return method.trim().toLowerCase(Locale.ROOT);
    }

    private void clearDefaultAddresses(Long userId) {
        List<UserAddress> addresses = userAddressRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (UserAddress current : addresses) {
            if (current.isDefault()) {
                current.setDefault(false);
                userAddressRepository.save(current);
            }
        }
    }

    private void clearDefaultPaymentMethods(Long userId) {
        List<UserPaymentMethod> methods = userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (UserPaymentMethod current : methods) {
            if (current.isDefault()) {
                current.setDefault(false);
                userPaymentMethodRepository.save(current);
            }
        }
    }

    private UserAddressResponse toAddressResponse(UserAddress address) {
        return new UserAddressResponse(
                address.getId(),
                address.getLabel(),
                address.getFullName(),
                address.getEmail(),
                address.getAddress(),
                address.getCity(),
                address.getPostalCode(),
                address.getCountry(),
                address.isDefault()
        );
    }

    private UserPaymentMethodResponse toPaymentMethodResponse(UserPaymentMethod paymentMethod) {
        return new UserPaymentMethodResponse(
                paymentMethod.getId(),
                paymentMethod.getLabel(),
                paymentMethod.getMethod(),
                paymentMethod.getCardLast4(),
                paymentMethod.getCardExpiry(),
                paymentMethod.getPaypalEmail(),
                paymentMethod.isDefault()
        );
    }

    private UserAccount getUserByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
