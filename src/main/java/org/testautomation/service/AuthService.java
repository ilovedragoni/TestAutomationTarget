package org.testautomation.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.testautomation.domain.AuthUserDTO;
import org.testautomation.domain.SignInRequest;
import org.testautomation.domain.SignInResponse;
import org.testautomation.domain.SignUpRequest;
import org.testautomation.domain.SignUpResponse;
import org.testautomation.entity.UserAccount;
import org.testautomation.repository.UserAccountRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager
    ) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public SignInResponse signIn(SignInRequest request, HttpServletRequest httpServletRequest) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid credentials");
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        int sessionTtlSeconds = (int) (request.isRememberMe()
                ? ChronoUnit.DAYS.getDuration().multipliedBy(30).getSeconds()
                : ChronoUnit.HOURS.getDuration().multipliedBy(12).getSeconds());

        HttpSession session = httpServletRequest.getSession(true);
        session.setMaxInactiveInterval(sessionTtlSeconds);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        UserAccount userAccount = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Instant expiresAt = Instant.now().plusSeconds(sessionTtlSeconds);
        AuthUserDTO user = new AuthUserDTO(userAccount.getId(), userAccount.getEmail(), userAccount.getDisplayName());
        return new SignInResponse(session.getId(), user, expiresAt.toString());
    }

    public Optional<SignInResponse> getCurrentSession(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession(false);
        if (session == null) {
            return Optional.empty();
        }

        Object contextObject = session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
        if (!(contextObject instanceof SecurityContext context)) {
            return Optional.empty();
        }

        Authentication authentication = context.getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }

        String normalizedEmail = authentication.getName().trim().toLowerCase();
        UserAccount userAccount = userAccountRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (userAccount == null || !userAccount.isEnabled()) {
            return Optional.empty();
        }

        int maxInactiveIntervalSeconds = session.getMaxInactiveInterval();
        Instant expiresAt = Instant.now().plusSeconds(Math.max(maxInactiveIntervalSeconds, 0));
        AuthUserDTO user = new AuthUserDTO(userAccount.getId(), userAccount.getEmail(), userAccount.getDisplayName());
        return Optional.of(new SignInResponse(session.getId(), user, expiresAt.toString()));
    }

    public void logout(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    public SignUpResponse signUp(SignUpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedName = request.getName().trim();

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already in use");
        }

        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(normalizedEmail);
        userAccount.setDisplayName(normalizedName);
        userAccount.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userAccount.setEnabled(true);
        userAccountRepository.save(userAccount);

        AuthUserDTO user = new AuthUserDTO(userAccount.getId(), userAccount.getEmail(), userAccount.getDisplayName());
        return new SignUpResponse(user, "Account created successfully.");
    }
}
