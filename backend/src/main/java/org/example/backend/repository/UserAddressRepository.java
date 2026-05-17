package org.example.backend.repository;

import org.example.backend.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByDefaultAddressDescUpdatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
