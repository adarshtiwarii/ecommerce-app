package org.example.backend.service;

import org.example.backend.exception.BadRequestException;
import org.example.backend.model.UserAddress;
import org.example.backend.repository.UserAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

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
        if (userId == null) {
            throw new BadRequestException("Authenticated user is required");
        }
        if (input == null) {
            throw new BadRequestException("Address details are required");
        }
        validate(input);

        UserAddress address = input.getAddressId() == null
                ? new UserAddress()
                : userAddressRepository.findById(input.getAddressId()).orElseThrow(() -> new BadRequestException("Address not found"));
        if (address.getAddressId() != null && !Objects.equals(address.getUserId(), userId)) {
            throw new BadRequestException("Unauthorized address access");
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
        } else if (address.getAddressId() == null) {
            address.setDefaultAddress(false);
        }
        return userAddressRepository.save(address);
    }

    @Transactional
    public void makeDefault(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new BadRequestException("Address not found"));
        if (!Objects.equals(address.getUserId(), userId)) throw new BadRequestException("Unauthorized address access");
        clearDefault(userId);
        address.setDefaultAddress(true);
        address.setUpdatedAt(LocalDateTime.now());
        userAddressRepository.save(address);
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new BadRequestException("Address not found"));
        if (!Objects.equals(address.getUserId(), userId)) throw new BadRequestException("Unauthorized address access");
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

    private void validate(UserAddress input) {
        require(input.getFullName(), "Full name is required");
        require(input.getPhoneNumber(), "Mobile number is required");
        require(input.getLine1(), "Address line is required");
        require(input.getCity(), "City is required");
        require(input.getState(), "State is required");
        require(input.getPincode(), "Pincode is required");

        String phone = clean(input.getPhoneNumber());
        if (!phone.matches("\\d{10}")) {
            throw new BadRequestException("Mobile number must be 10 digits");
        }

        String pincode = clean(input.getPincode());
        if (!pincode.matches("\\d{6}")) {
            throw new BadRequestException("Pincode must be 6 digits");
        }
    }

    private void require(String value, String message) {
        if (clean(value) == null || clean(value).isEmpty()) {
            throw new BadRequestException(message);
        }
    }
}
