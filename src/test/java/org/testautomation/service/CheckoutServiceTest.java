package org.testautomation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.testautomation.domain.CheckoutItemRequest;
import org.testautomation.domain.CheckoutPaymentRequest;
import org.testautomation.domain.CheckoutRequest;
import org.testautomation.domain.CheckoutResponse;
import org.testautomation.domain.CheckoutShippingRequest;
import org.testautomation.entity.Product;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserAddress;
import org.testautomation.entity.UserCartItem;
import org.testautomation.entity.UserOrder;
import org.testautomation.entity.UserPaymentMethod;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserAddressRepository;
import org.testautomation.repository.UserCartItemRepository;
import org.testautomation.repository.UserOrderRepository;
import org.testautomation.repository.UserPaymentMethodRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;
    @Mock
    private UserCartItemRepository userCartItemRepository;
    @Mock
    private UserOrderRepository userOrderRepository;
    @Mock
    private UserAddressRepository userAddressRepository;
    @Mock
    private UserPaymentMethodRepository userPaymentMethodRepository;

    @InjectMocks
    private CheckoutService checkoutService;

    @Test
    void checkoutThrowsWhenCartIsEmpty() {
        UserAccount user = user(1L, "empty@example.com");
        when(userAccountRepository.findByEmailIgnoreCase("empty@example.com")).thenReturn(Optional.of(user));
        when(userCartItemRepository.findByUserId(1L)).thenReturn(List.of());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout("empty@example.com", new CheckoutRequest()));
        assertThat(exception.getMessage()).isEqualTo("Your cart is empty");
    }

    @Test
    void checkoutThrowsWhenSubtotalDoesNotMatch() {
        UserAccount user = user(2L, "subtotal@example.com");
        Product product = product(100L, "Laptop", "999.99");
        UserCartItem cartItem = cartItem(user, product, 1);
        when(userAccountRepository.findByEmailIgnoreCase("subtotal@example.com")).thenReturn(Optional.of(user));
        when(userCartItemRepository.findByUserId(2L)).thenReturn(List.of(cartItem));

        CheckoutRequest request = checkoutRequestCardWithNewShipping("USD", new BigDecimal("10.00"), 100L, 1);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout("subtotal@example.com", request));
        assertThat(exception.getMessage()).isEqualTo("Subtotal mismatch. Refresh and try checkout again.");
    }

    @Test
    void checkoutThrowsWhenSavedAddressDoesNotExist() {
        UserAccount user = user(3L, "saved.address@example.com");
        Product product = product(101L, "Mouse", "20.00");
        UserCartItem cartItem = cartItem(user, product, 1);
        when(userAccountRepository.findByEmailIgnoreCase("saved.address@example.com")).thenReturn(Optional.of(user));
        when(userCartItemRepository.findByUserId(3L)).thenReturn(List.of(cartItem));
        when(userAddressRepository.findByIdAndUserId(777L, 3L)).thenReturn(Optional.empty());

        CheckoutRequest request = checkoutRequestCardWithNewShipping("USD", new BigDecimal("20.00"), 101L, 1);
        request.setSavedAddressId(777L);
        request.setShipping(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout("saved.address@example.com", request));
        assertThat(exception.getMessage()).isEqualTo("Saved address not found");
    }

    @Test
    void checkoutWithSavedPaymentMethodUsesStoredValues() {
        UserAccount user = user(4L, "saved.payment@example.com");
        Product product = product(102L, "Keyboard", "50.00");
        UserCartItem cartItem = cartItem(user, product, 2);
        UserAddress address = address(user);
        UserPaymentMethod method = new UserPaymentMethod();
        method.setId(9L);
        method.setUser(user);
        method.setMethod("card");
        method.setCardLast4("4242");
        method.setCardExpiry("01/30");

        when(userAccountRepository.findByEmailIgnoreCase("saved.payment@example.com")).thenReturn(Optional.of(user));
        when(userCartItemRepository.findByUserId(4L)).thenReturn(List.of(cartItem));
        when(userAddressRepository.findByIdAndUserId(5L, 4L)).thenReturn(Optional.of(address));
        when(userPaymentMethodRepository.findByIdAndUserId(9L, 4L)).thenReturn(Optional.of(method));
        when(userOrderRepository.save(any(UserOrder.class))).thenAnswer(invocation -> {
            UserOrder order = invocation.getArgument(0);
            order.setId(88L);
            return order;
        });

        CheckoutRequest request = checkoutRequestCardWithNewShipping("USD", new BigDecimal("100.00"), 102L, 2);
        request.setSavedAddressId(5L);
        request.setShipping(null);
        request.setSavedPaymentMethodId(9L);
        request.setPayment(null);

        CheckoutResponse response = checkoutService.checkout("saved.payment@example.com", request);

        assertThat(response.getOrderId()).isEqualTo("ORD-88");
        assertThat(response.getStatus()).isEqualTo("accepted");
        verify(userCartItemRepository).deleteByUserId(4L);

        ArgumentCaptor<UserOrder> orderCaptor = ArgumentCaptor.forClass(UserOrder.class);
        verify(userOrderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getPaymentCardLast4()).isEqualTo("4242");
        assertThat(orderCaptor.getValue().getPaymentCardExpiry()).isEqualTo("01/30");
    }

    @Test
    void checkoutWithNewCardAndSavePaymentPersistsPaymentMethod() {
        UserAccount user = user(5L, "new.payment@example.com");
        Product product = product(103L, "Monitor", "250.00");
        UserCartItem cartItem = cartItem(user, product, 1);
        when(userAccountRepository.findByEmailIgnoreCase("new.payment@example.com")).thenReturn(Optional.of(user));
        when(userCartItemRepository.findByUserId(5L)).thenReturn(List.of(cartItem));
        when(userPaymentMethodRepository.findByUserIdOrderByCreatedAtDesc(5L)).thenReturn(List.of());
        when(userOrderRepository.save(any(UserOrder.class))).thenAnswer(invocation -> {
            UserOrder order = invocation.getArgument(0);
            order.setId(99L);
            return order;
        });

        CheckoutRequest request = checkoutRequestCardWithNewShipping("USD", new BigDecimal("250.00"), 103L, 1);
        request.setSavePaymentMethod(true);
        request.setPaymentMethodLabel("Primary Card");

        checkoutService.checkout("new.payment@example.com", request);

        ArgumentCaptor<UserPaymentMethod> paymentCaptor = ArgumentCaptor.forClass(UserPaymentMethod.class);
        verify(userPaymentMethodRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getCardLast4()).isEqualTo("1111");
        assertThat(paymentCaptor.getValue().getLabel()).isEqualTo("Primary Card");
        assertThat(paymentCaptor.getValue().isDefault()).isTrue();
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

    private Product product(Long id, String name, String price) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setPrice(new BigDecimal(price));
        return product;
    }

    private UserCartItem cartItem(UserAccount user, Product product, int quantity) {
        UserCartItem item = new UserCartItem();
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(quantity);
        return item;
    }

    private UserAddress address(UserAccount user) {
        UserAddress address = new UserAddress();
        address.setId(5L);
        address.setUser(user);
        address.setFullName("John Doe");
        address.setEmail("john@example.com");
        address.setAddress("Street 1");
        address.setCity("City");
        address.setPostalCode("12345");
        address.setCountry("Country");
        address.setLabel("Home");
        return address;
    }

    private CheckoutRequest checkoutRequestCardWithNewShipping(String currency, BigDecimal subtotal, Long productId, int quantity) {
        CheckoutShippingRequest shipping = new CheckoutShippingRequest();
        shipping.setFullName("John Doe");
        shipping.setEmail("john@example.com");
        shipping.setAddress("Street 1");
        shipping.setCity("City");
        shipping.setPostalCode("12345");
        shipping.setCountry("Country");

        CheckoutPaymentRequest payment = new CheckoutPaymentRequest();
        payment.setMethod("card");
        payment.setCardNumber("4111111111111111");
        payment.setCardExpiry("01/30");
        payment.setCardCvc("123");

        CheckoutItemRequest item = new CheckoutItemRequest();
        item.setProductId(productId);
        item.setQuantity(quantity);
        item.setUnitPrice(subtotal.divide(BigDecimal.valueOf(quantity)));

        CheckoutRequest request = new CheckoutRequest();
        request.setShipping(shipping);
        request.setPayment(payment);
        request.setItems(List.of(item));
        request.setSubtotal(subtotal);
        request.setCurrency(currency);
        return request;
    }
}
