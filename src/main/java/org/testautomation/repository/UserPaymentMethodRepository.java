package org.testautomation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.testautomation.entity.UserPaymentMethod;

import java.util.List;
import java.util.Optional;

public interface UserPaymentMethodRepository extends JpaRepository<UserPaymentMethod, Long> {

    List<UserPaymentMethod> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserPaymentMethod> findByIdAndUserId(Long id, Long userId);
}
