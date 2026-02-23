package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.domain.OrderItemResponse;
import org.testautomation.domain.OrderSummaryResponse;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserOrder;
import org.testautomation.entity.UserOrderItem;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserOrderRepository;

import java.util.List;

@Service
public class OrderService {

    private final UserAccountRepository userAccountRepository;
    private final UserOrderRepository userOrderRepository;

    public OrderService(UserAccountRepository userAccountRepository, UserOrderRepository userOrderRepository) {
        this.userAccountRepository = userAccountRepository;
        this.userOrderRepository = userOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrders(String email) {
        UserAccount userAccount = getUserByEmail(email);
        return userOrderRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    private OrderSummaryResponse toDto(UserOrder order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toDto)
                .toList();

        return new OrderSummaryResponse(
                "ORD-" + order.getId(),
                order.getStatus(),
                order.getCreatedAt().toString(),
                order.getCurrency(),
                order.getSubtotal(),
                items
        );
    }

    private OrderItemResponse toDto(UserOrderItem item) {
        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProductName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }

    private UserAccount getUserByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
