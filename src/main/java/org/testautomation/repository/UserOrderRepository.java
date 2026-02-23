package org.testautomation.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.testautomation.entity.UserOrder;

import java.util.List;

public interface UserOrderRepository extends JpaRepository<UserOrder, Long> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<UserOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}
