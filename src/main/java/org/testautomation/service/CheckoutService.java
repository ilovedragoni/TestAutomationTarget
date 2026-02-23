package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.domain.CheckoutItemRequest;
import org.testautomation.domain.CheckoutPaymentRequest;
import org.testautomation.domain.CheckoutRequest;
import org.testautomation.domain.CheckoutResponse;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserCartItem;
import org.testautomation.entity.UserOrder;
import org.testautomation.entity.UserOrderItem;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserCartItemRepository;
import org.testautomation.repository.UserOrderRepository;

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

    public CheckoutService(
            UserAccountRepository userAccountRepository,
            UserCartItemRepository userCartItemRepository,
            UserOrderRepository userOrderRepository
    ) {
        this.userAccountRepository = userAccountRepository;
        this.userCartItemRepository = userCartItemRepository;
        this.userOrderRepository = userOrderRepository;
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

        CheckoutPaymentRequest payment = request.getPayment();
        String paymentMethod = normalizePaymentMethod(payment.getMethod());
        validatePaymentByMethod(payment, paymentMethod);

        UserOrder order = new UserOrder();
        order.setUser(userAccount);
        order.setStatus("accepted");
        order.setCurrency(SUPPORTED_CURRENCY);
        order.setSubtotal(subtotal);
        order.setShippingFullName(request.getShipping().getFullName().trim());
        order.setShippingEmail(request.getShipping().getEmail().trim().toLowerCase(Locale.ROOT));
        order.setShippingAddress(request.getShipping().getAddress().trim());
        order.setShippingCity(request.getShipping().getCity().trim());
        order.setShippingPostalCode(request.getShipping().getPostalCode().trim());
        order.setShippingCountry(request.getShipping().getCountry().trim());
        order.setPaymentMethod(paymentMethod);

        if ("card".equals(paymentMethod)) {
            String cardNumber = payment.getCardNumber().trim();
            order.setPaymentCardLast4(cardNumber.substring(cardNumber.length() - 4));
            order.setPaymentCardExpiry(payment.getCardExpiry().trim());
        } else {
            order.setPaymentPaypalEmail(payment.getPaypalEmail().trim().toLowerCase(Locale.ROOT));
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

    private void requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
    }

    private UserAccount getUserByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
