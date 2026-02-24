package org.testautomation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.testautomation.domain.OrderSummaryResponse;
import org.testautomation.entity.Product;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserOrder;
import org.testautomation.entity.UserOrderItem;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserOrderRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private UserOrderRepository userOrderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void getOrdersMapsOrderAndLineItems() {
        UserAccount user = new UserAccount();
        user.setId(9L);
        user.setEmail("orders@example.com");

        Product product = new Product();
        product.setId(101L);
        product.setName("Keyboard");

        UserOrderItem item = new UserOrderItem();
        item.setProduct(product);
        item.setProductName("Keyboard");
        item.setUnitPrice(new BigDecimal("99.90"));
        item.setQuantity(2);
        item.setLineTotal(new BigDecimal("199.80"));

        UserOrder order = new UserOrder();
        order.setId(44L);
        order.setStatus("accepted");
        order.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
        order.setCurrency("USD");
        order.setSubtotal(new BigDecimal("199.80"));
        order.setItems(List.of(item));

        when(userAccountRepository.findByEmailIgnoreCase("orders@example.com")).thenReturn(Optional.of(user));
        when(userOrderRepository.findByUserIdOrderByCreatedAtDesc(9L)).thenReturn(List.of(order));

        List<OrderSummaryResponse> responses = orderService.getOrders("orders@example.com");

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getOrderId()).isEqualTo("ORD-44");
        assertThat(responses.get(0).getItems()).hasSize(1);
        assertThat(responses.get(0).getItems().get(0).getProductId()).isEqualTo(101L);
    }

    @Test
    void getOrdersThrowsWhenUserDoesNotExist() {
        when(userAccountRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> orderService.getOrders("missing@example.com"));
        assertThat(exception.getMessage()).isEqualTo("User not found");
    }
}
