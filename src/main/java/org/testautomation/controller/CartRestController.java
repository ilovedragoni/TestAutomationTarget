package org.testautomation.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.testautomation.domain.CartItemRequest;
import org.testautomation.domain.CartResponse;
import org.testautomation.service.CartService;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartRestController {

    private final CartService cartService;

    public CartRestController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<CartResponse> replaceCart(
            Authentication authentication,
            @Valid @RequestBody List<@Valid CartItemRequest> payload
    ) {
        return ResponseEntity.ok(cartService.replaceCart(authentication.getName(), payload));
    }

    @PostMapping("/merge")
    public ResponseEntity<CartResponse> mergeCart(
            Authentication authentication,
            @Valid @RequestBody List<@Valid CartItemRequest> payload
    ) {
        return ResponseEntity.ok(cartService.mergeCart(authentication.getName(), payload));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
