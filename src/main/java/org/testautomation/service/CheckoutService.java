package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.domain.CheckoutItemRequest;
import org.testautomation.domain.CheckoutPaymentRequest;
import org.testautomation.domain.CheckoutRequest;
import org.testautomation.domain.CheckoutResponse;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserAddress;
import org.testautomation.entity.UserCartItem;
import org.testautomation.entity.UserOrder;
import org.testautomation.entity.UserOrderItem;
import org.testautomation.entity.UserPaymentMethod;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserAddressRepository;
import org.testautomation.repository.UserCartItemRepository;
import org.testautomation.repository.UserOrderRepository;
import org.testautomation.repository.UserPaymentMethodRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CheckoutService {

    private static final String SUPPORTED_CURRENCY = "USD";

    private final UserAccountRepository userAccountRepository;
    private final UserCartItemRepository userCartItemRepository;
    private final UserOrderRepository userOrderRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserPaymentMethodRepository userPaymentMethodRepository;

    public CheckoutService(
            UserAccountRepository userAccountRepository,
            UserCartItemRepository userCartItemRepository,
            UserOrderRepository userOrderRepository,
            UserAddressRepository userAddressRepository,
            UserPaymentMethodRepository userPaymentMethodRepository
    ) {
        this.userAccountRepository = userAccountRepository;
        this.userCartItemRepository = userCartItemRepository;
        this.userOrderRepository = userOrderRepository;
        this.userAddressRepository = userAddressRepository;
        this.userPaymentMethodRepository = userPaymentMethodRepository;
    }

    @Transactional
    public CheckoutResponse checkout(String email, CheckoutRequest request) {
        UserAccount userAccount = getUserByEmail(email);
        List<UserCartItem> cartItems = userCartItemRepository.findByUserId(userAccount.getId());
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty");
        }

        validateCurrency(request.getCurrency());
        validateItemsMatchCart(cartItems, request.getItems());

        BigDecimal subtotal = calculateSubtotal(cartItems);
        validateSubtotal(subtotal, request.getSubtotal());

        UserAddress resolvedAddress = resolveAddress(userAccount, request);
        ResolvedPayment resolvedPayment = resolvePayment(userAccount, request);

        UserOrder order = new UserOrder();
        order.setUser(userAccount);
        order.setStatus("accepted");
        order.setCurrency(SUPPORTED_CURRENCY);
        order.setSubtotal(subtotal);
        order.setShippingFullName(resolvedAddress.getFullName());
        order.setShippingEmail(resolvedAddress.getEmail());
        order.setShippingAddress(resolvedAddress.getAddress());
        order.setShippingCity(resolvedAddress.getCity());
        order.setShippingPostalCode(resolvedAddress.getPostalCode());
        order.setShippingCountry(resolvedAddress.getCountry());
        order.setPaymentMethod(resolvedPayment.method);

        if ("card".equals(resolvedPayment.method)) {
            order.setPaymentCardLast4(resolvedPayment.cardLast4);
            order.setPaymentCardExpiry(resolvedPayment.cardExpiry);
        } else {
            order.setPaymentPaypalEmail(resolvedPayment.paypalEmail);
        }

        for (UserCartItem cartItem : cartItems) {
            BigDecimal unitPrice = cartItem.getProduct().getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())).setScale(2, RoundingMode.HALF_UP);

            UserOrderItem orderItem = new UserOrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setLineTotal(lineTotal);
            order.addItem(orderItem);
        }

        UserOrder savedOrder = userOrderRepository.save(order);
        userCartItemRepository.deleteByUserId(userAccount.getId());

        return new CheckoutResponse(
                "ORD-" + savedOrder.getId(),
                savedOrder.getStatus(),
                "Order placed successfully."
        );
    }

    private void validateCurrency(String currency) {
        if (currency == null || !SUPPORTED_CURRENCY.equalsIgnoreCase(currency.trim())) {
            throw new IllegalArgumentException("Unsupported currency: " + currency);
        }
    }

    private void validateItemsMatchCart(List<UserCartItem> cartItems, List<CheckoutItemRequest> checkoutItems) {
        Map<Long, Integer> cartQuantitiesByProductId = cartItems.stream()
                .collect(Collectors.toMap(item -> item.getProduct().getId(), UserCartItem::getQuantity));

        Map<Long, Integer> requestQuantitiesByProductId = checkoutItems.stream()
                .collect(Collectors.toMap(CheckoutItemRequest::getProductId, CheckoutItemRequest::getQuantity, Integer::sum));

        Set<Long> cartProductIds = cartQuantitiesByProductId.keySet();
        Set<Long> requestProductIds = requestQuantitiesByProductId.keySet();
        if (!cartProductIds.equals(requestProductIds)) {
            throw new IllegalArgumentException("Cart changed. Refresh and try checkout again.");
        }

        for (Long productId : cartProductIds) {
            Integer cartQuantity = cartQuantitiesByProductId.get(productId);
            Integer requestQuantity = requestQuantitiesByProductId.get(productId);
            if (!cartQuantity.equals(requestQuantity)) {
                throw new IllegalArgumentException("Cart changed. Refresh and try checkout again.");
            }
        }
    }

    private BigDecimal calculateSubtotal(List<UserCartItem> cartItems) {
        return cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void validateSubtotal(BigDecimal expectedSubtotal, BigDecimal providedSubtotal) {
        BigDecimal normalizedProvided = providedSubtotal.setScale(2, RoundingMode.HALF_UP);
        if (expectedSubtotal.compareTo(normalizedProvided) != 0) {
            throw new IllegalArgumentException("Subtotal mismatch. Refresh and try checkout again.");
        }
    }

    private String normalizePaymentMethod(String method) {
        if (method == null) {
            throw new IllegalArgumentException("payment.method is required");
        }
        return method.trim().toLowerCase(Locale.ROOT);
    }

    private void validatePaymentByMethod(CheckoutPaymentRequest payment, String paymentMethod) {
        if ("card".equals(paymentMethod)) {
            requireText(payment.getCardNumber(), "cardNumber is required for card payments");
            requireText(payment.getCardExpiry(), "cardExpiry is required for card payments");
            requireText(payment.getCardCvc(), "cardCvc is required for card payments");
            return;
        }

        if ("paypal".equals(paymentMethod)) {
            requireText(payment.getPaypalEmail(), "paypalEmail is required for paypal payments");
            return;
        }

        throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
    }

    private UserAddress resolveAddress(UserAccount userAccount, CheckoutRequest request) {
        if (request.getSavedAddressId() != null) {
            return userAddressRepository.findByIdAndUserId(request.getSavedAddressId(), userAccount.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Saved address not found"));
        }

        if (request.getShipping() == null) {
            throw new IllegalArgumentException("shipping is required");
        }

        UserAddress address = new UserAddress();
        address.setUser(userAccount);
        address.setLabel(resolveAddressLabel(request));
        address.setFullName(request.getShipping().getFullName().trim());
        address.setEmail(request.getShipping().getEmail().trim().toLowerCase(Locale.ROOT));
        address.setAddress(request.getShipping().getAddress().trim());
        address.setCity(request.getShipping().getCity().trim());
        address.setPostalCode(request.getShipping().getPostalCode().trim());
        address.setCountry(request.getShipping().getCountry().trim());
        address.setDefault(false);

        if (request.isSaveShippingAddress()) {
            persistAddress(userAccount.getId(), address);
        }

        return address;
    }

    private ResolvedPayment resolvePayment(UserAccount userAccount, CheckoutRequest request) {
        if (request.getSavedPaymentMethodId() != null) {
            UserPaymentMethod saved = userPaymentMethodRepository.findByIdAndUserId(request.getSavedPaymentMethodId(), userAccount.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Saved payment method not found"));
            if ("card".equals(saved.getMethod())) {
                return new ResolvedPayment("card", saved.getCardLast4(), saved.getCardExpiry(), null);
            }
            if ("paypal".equals(saved.getMethod())) {
                return new ResolvedPayment("paypal", null, null, saved.getPaypalEmail());
            }
            throw new IllegalArgumentException("Unsupported payment method: " + saved.getMethod());
        }

        CheckoutPaymentRequest payment = request.getPayment();
        if (payment == null) {
            throw new IllegalArgumentException("payment is required");
        }

        String paymentMethod = normalizePaymentMethod(payment.getMethod());
        validatePaymentByMethod(payment, paymentMethod);
        if ("card".equals(paymentMethod)) {
            String cardNumber = payment.getCardNumber().trim();
            String cardLast4 = cardNumber.substring(cardNumber.length() - 4);
            String cardExpiry = payment.getCardExpiry().trim();

            if (request.isSavePaymentMethod()) {
                UserPaymentMethod method = new UserPaymentMethod();
                method.setUser(userAccount);
                method.setMethod("card");
                method.setLabel(resolvePaymentLabel(request, "Card"));
                method.setCardLast4(cardLast4);
                method.setCardExpiry(cardExpiry);
                method.setPaypalEmail(null);
                method.setDefault(false);
                persistPaymentMethod(userAccount.getId(), method);
            }

            return new ResolvedPayment("card", cardLast4, cardExpiry, null);
        }

        String paypalEmail = payment.getPaypalEmail().trim().toLowerCase(Locale.ROOT);
        if (request.isSavePaymentMethod()) {
            UserPaymentMethod method = new UserPaymentMethod();
            method.setUser(userAccount);
            method.setMethod("paypal");
            method.setLabel(resolvePaymentLabel(request, "PayPal"));
            method.setPaypalEmail(paypalEmail);
            method.setCardLast4(null);
            method.setCardExpiry(null);
            method.setDefault(false);
            persistPaymentMethod(userAccount.getId(), method);
        }
        return new ResolvedPayment("paypal", null, null, paypalEmail);
    }

    private String resolveAddressLabel(CheckoutRequest request) {
        if (request.getShippingAddressLabel() == null || request.getShippingAddressLabel().trim().isEmpty()) {
            return "Saved address";
        }
        return request.getShippingAddressLabel().trim();
    }

    private String resolvePaymentLabel(CheckoutRequest request, String fallback) {
        if (request.getPaymentMethodLabel() == null || request.getPaymentMethodLabel().trim().isEmpty()) {
            return fallback;
        }
        return request.getPaymentMethodLabel().trim();
    }

    private void persistAddress(Long userId, UserAddress address) {
        List<UserAddress> existing = userAddressRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (existing.isEmpty()) {
            address.setDefault(true);
        }
        userAddressRepository.save(address);
    }

    private void persistPaymentMethod(Long userId, UserPaymentMethod method) {
        List<UserPaymentMethod> existing = userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (existing.isEmpty()) {
            method.setDefault(true);
        }
        userPaymentMethodRepository.save(method);
    }

    private void requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
    }

    private UserAccount getUserByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private record ResolvedPayment(String method, String cardLast4, String cardExpiry, String paypalEmail) {
    }
}
