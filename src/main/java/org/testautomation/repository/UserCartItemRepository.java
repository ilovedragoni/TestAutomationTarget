package org.testautomation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.testautomation.entity.UserCartItem;

import java.util.List;

public interface UserCartItemRepository extends JpaRepository<UserCartItem, Long> {

    List<UserCartItem> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
