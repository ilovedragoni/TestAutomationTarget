package org.testautomation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.testautomation.entity.UserAddress;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);
}
