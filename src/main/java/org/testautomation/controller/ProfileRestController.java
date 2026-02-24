package org.testautomation.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.testautomation.domain.UserAddressRequest;
import org.testautomation.domain.UserAddressResponse;
import org.testautomation.domain.UserPaymentMethodRequest;
import org.testautomation.domain.UserPaymentMethodResponse;
import org.testautomation.service.ProfileService;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileRestController {

    private final ProfileService profileService;

    public ProfileRestController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<UserAddressResponse>> getAddresses(Authentication authentication) {
        return ResponseEntity.ok(profileService.getAddresses(authentication.getName()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<UserAddressResponse> addAddress(
            Authentication authentication,
            @Valid @RequestBody UserAddressRequest request
    ) {
        return ResponseEntity.ok(profileService.addAddress(authentication.getName(), request));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(Authentication authentication, @PathVariable Long addressId) {
        profileService.deleteAddress(authentication.getName(), addressId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/addresses/{addressId}/default")
    public ResponseEntity<UserAddressResponse> setDefaultAddress(Authentication authentication, @PathVariable Long addressId) {
        return ResponseEntity.ok(profileService.setDefaultAddress(authentication.getName(), addressId));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<UserPaymentMethodResponse>> getPaymentMethods(Authentication authentication) {
        return ResponseEntity.ok(profileService.getPaymentMethods(authentication.getName()));
    }

    @PostMapping("/payment-methods")
    public ResponseEntity<UserPaymentMethodResponse> addPaymentMethod(
            Authentication authentication,
            @Valid @RequestBody UserPaymentMethodRequest request
    ) {
        return ResponseEntity.ok(profileService.addPaymentMethod(authentication.getName(), request));
    }

    @DeleteMapping("/payment-methods/{paymentMethodId}")
    public ResponseEntity<Void> deletePaymentMethod(Authentication authentication, @PathVariable Long paymentMethodId) {
        profileService.deletePaymentMethod(authentication.getName(), paymentMethodId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/payment-methods/{paymentMethodId}/default")
    public ResponseEntity<UserPaymentMethodResponse> setDefaultPaymentMethod(
            Authentication authentication,
            @PathVariable Long paymentMethodId
    ) {
        return ResponseEntity.ok(profileService.setDefaultPaymentMethod(authentication.getName(), paymentMethodId));
    }
}
