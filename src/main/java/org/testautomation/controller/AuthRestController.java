package org.testautomation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.testautomation.domain.SignInRequest;
import org.testautomation.domain.SignInResponse;
import org.testautomation.domain.SignUpRequest;
import org.testautomation.domain.SignUpResponse;
import org.testautomation.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final AuthService authService;

    public AuthRestController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<SignInResponse> signIn(@Valid @RequestBody SignInRequest request, HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(authService.signIn(request, httpServletRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.ok(authService.signUp(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest httpServletRequest) {
        return authService.getCurrentSession(httpServletRequest)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Not authenticated")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpServletRequest) {
        authService.logout(httpServletRequest);
        return ResponseEntity.noContent().build();
    }
}
