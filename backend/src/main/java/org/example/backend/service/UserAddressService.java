package org.example.backend.service;

import org.example.backend.model.UserAddress;
import org.example.backend.repository.UserAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserAddressService {
    private final UserAddressRepository userAddressRepository;

    public UserAddressService(UserAddressRepository userAddressRepository) {
        this.userAddressRepository = userAddressRepository;
    }

    public List<UserAddress> list(Long userId) {
        return userAddressRepository.findByUserIdOrderByDefaultAddressDescUpdatedAtDesc(userId);
    }

    @Transactional
    public UserAddress save(Long userId, UserAddress input) {
        UserAddress address = input.getAddressId() == null
                ? new UserAddress()
                : userAddressRepository.findById(input.getAddressId()).orElseThrow(() -> new RuntimeException("Address not found"));
        if (address.getAddressId() != null && !address.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized address access");
        }
        address.setUserId(userId);
        address.setLabel(clean(input.getLabel()));
        address.setFullName(clean(input.getFullName()));
        address.setPhoneNumber(clean(input.getPhoneNumber()));
        address.setLine1(clean(input.getLine1()));
        address.setLine2(clean(input.getLine2()));
        address.setCity(clean(input.getCity()));
        address.setState(clean(input.getState()));
        address.setPincode(clean(input.getPincode()));
        address.setLatitude(input.getLatitude());
        address.setLongitude(input.getLongitude());
        address.setUpdatedAt(LocalDateTime.now());
        boolean firstAddress = userAddressRepository.countByUserId(userId) == 0;
        if (input.isDefaultAddress() || firstAddress) {
            clearDefault(userId);
            address.setDefaultAddress(true);
        }
        return userAddressRepository.save(address);
    }

    @Transactional
    public void makeDefault(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUserId().equals(userId)) throw new RuntimeException("Unauthorized address access");
        clearDefault(userId);
        address.setDefaultAddress(true);
        address.setUpdatedAt(LocalDateTime.now());
        userAddressRepository.save(address);
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUserId().equals(userId)) throw new RuntimeException("Unauthorized address access");
        userAddressRepository.delete(address);
    }

    private void clearDefault(Long userId) {
        userAddressRepository.findByUserIdOrderByDefaultAddressDescUpdatedAtDesc(userId).forEach(address -> {
            address.setDefaultAddress(false);
            userAddressRepository.save(address);
        });
    }

    private String clean(String value) {
        return value == null ? null : value.replaceAll("[<>]", "").trim();
    }
}
