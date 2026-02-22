package org.testautomation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.testautomation.entity.UserCartItem;

import java.util.List;
import java.util.Optional;

public interface UserCartItemRepository extends JpaRepository<UserCartItem, Long> {

    List<UserCartItem> findByUserId(Long userId);

    Optional<UserCartItem> findByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);
}
