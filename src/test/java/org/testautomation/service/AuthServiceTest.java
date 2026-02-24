package org.testautomation.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.testautomation.domain.SignInRequest;
import org.testautomation.domain.SignInResponse;
import org.testautomation.domain.SignUpRequest;
import org.testautomation.entity.UserAccount;
import org.testautomation.repository.UserAccountRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private HttpServletRequest httpServletRequest;

    @Mock
    private HttpSession httpSession;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void signUpCreatesUserWhenEmailIsAvailable() {
        SignUpRequest request = new SignUpRequest();
        request.setName("  Jane Doe ");
        request.setEmail("  Jane@Example.com ");
        request.setPassword("secret");

        when(userAccountRepository.existsByEmailIgnoreCase("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");

        authService.signUp(request);

        ArgumentCaptor<UserAccount> captor = ArgumentCaptor.forClass(UserAccount.class);
        verify(userAccountRepository).save(captor.capture());
        UserAccount saved = captor.getValue();

        assertThat(saved.getEmail()).isEqualTo("jane@example.com");
        assertThat(saved.getDisplayName()).isEqualTo("Jane Doe");
        assertThat(saved.getPasswordHash()).isEqualTo("encoded-secret");
        assertThat(saved.isEnabled()).isTrue();
    }

    @Test
    void signUpThrowsWhenEmailAlreadyExists() {
        SignUpRequest request = new SignUpRequest();
        request.setName("Jane");
        request.setEmail("jane@example.com");
        request.setPassword("secret");

        when(userAccountRepository.existsByEmailIgnoreCase("jane@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.signUp(request));
        assertThat(exception.getMessage()).isEqualTo("Email is already in use");
    }

    @Test
    void signInThrowsBadCredentialsWhenAuthenticationFails() {
        SignInRequest request = new SignInRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrong");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad"));

        assertThrows(BadCredentialsException.class, () -> authService.signIn(request, httpServletRequest));
    }

    @Test
    void signInCreatesSessionAndReturnsTokenAndUser() {
        SignInRequest request = new SignInRequest();
        request.setEmail("  User@Example.com ");
        request.setPassword("secret");
        request.setRememberMe(true);

        UserAccount user = new UserAccount();
        user.setId(12L);
        user.setEmail("user@example.com");
        user.setDisplayName("User Name");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(httpServletRequest.getSession(true)).thenReturn(httpSession);
        when(httpSession.getId()).thenReturn("session-id");
        when(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        SignInResponse response = authService.signIn(request, httpServletRequest);

        verify(httpSession).setMaxInactiveInterval(2592000);
        verify(httpSession).setAttribute(any(String.class), any(SecurityContext.class));
        assertThat(response.getToken()).isEqualTo("session-id");
        assertThat(response.getUser().getEmail()).isEqualTo("user@example.com");
        assertThat(response.getUser().getName()).isEqualTo("User Name");
    }

    @Test
    void getCurrentSessionReturnsEmptyWhenNoSessionExists() {
        when(httpServletRequest.getSession(false)).thenReturn(null);
        assertThat(authService.getCurrentSession(httpServletRequest)).isEmpty();
    }

    @Test
    void getCurrentSessionReturnsCurrentUserWhenSessionIsValid() {
        UserAccount user = new UserAccount();
        user.setId(5L);
        user.setEmail("session.user@example.com");
        user.setDisplayName("Session User");
        user.setEnabled(true);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("session.user@example.com");
        when(authentication.getName()).thenReturn("session.user@example.com");
        context.setAuthentication(authentication);

        when(httpServletRequest.getSession(false)).thenReturn(httpSession);
        when(httpSession.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY)).thenReturn(context);
        when(httpSession.getId()).thenReturn("session-id");
        when(httpSession.getMaxInactiveInterval()).thenReturn(3600);
        when(userAccountRepository.findByEmailIgnoreCase("session.user@example.com")).thenReturn(Optional.of(user));

        Optional<SignInResponse> response = authService.getCurrentSession(httpServletRequest);

        assertThat(response).isPresent();
        assertThat(response.get().getToken()).isEqualTo("session-id");
        assertThat(response.get().getUser().getId()).isEqualTo(5L);
    }

    @Test
    void logoutInvalidatesSessionAndClearsContext() {
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(httpServletRequest.getSession(false)).thenReturn(httpSession);

        authService.logout(httpServletRequest);

        verify(httpSession).invalidate();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
