package org.testautomation.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.testautomation.domain.AuthUserDTO;
import org.testautomation.domain.UserAddressResponse;
import org.testautomation.domain.UserPaymentMethodResponse;
import org.testautomation.service.ProfileService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProfileRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class ProfileRestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    @Test
    void getAddressesReturnsResponse() throws Exception {
        when(profileService.getAddresses("user@example.com"))
                .thenReturn(List.of(new UserAddressResponse(1L, "Home", "User", "user@example.com", "Street 1", "City", "12345", "Country", true)));

        mockMvc.perform(get("/api/profile/addresses")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label").value("Home"))
                .andExpect(jsonPath("$[0].default").value(true));
    }

    @Test
    void updateAccountReturnsUpdatedUser() throws Exception {
        when(profileService.updateAccount(eq("user@example.com"), any()))
                .thenReturn(new AuthUserDTO(7L, "updated@example.com", "Updated User"));

        mockMvc.perform(patch("/api/profile/account")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Updated User","email":"updated@example.com"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    void updateAccountReturnsBadRequestForInvalidPayload() throws Exception {
        mockMvc.perform(patch("/api/profile/account")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                .content("""
                                {"name":"","email":"bad-email"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void updatePasswordReturnsSuccessMessage() throws Exception {
        mockMvc.perform(patch("/api/profile/account/password")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"old-secret","newPassword":"new-secret-123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully"));

        verify(profileService).updatePassword(eq("user@example.com"), any());
    }

    @Test
    void deleteAccountReturnsSuccessMessage() throws Exception {
        mockMvc.perform(delete("/api/profile/account")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"secret-123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account deleted successfully"));

        verify(profileService).deleteAccount(eq("user@example.com"), any());
    }

    @Test
    void addAddressReturnsAddress() throws Exception {
        when(profileService.addAddress(eq("user@example.com"), any()))
                .thenReturn(new UserAddressResponse(11L, "Work", "User", "user@example.com", "Street 2", "City", "54321", "Country", false));

        mockMvc.perform(post("/api/profile/addresses")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "label":"Work",
                                  "fullName":"User",
                                  "email":"user@example.com",
                                  "address":"Street 2",
                                  "city":"City",
                                  "postalCode":"54321",
                                  "country":"Country",
                                  "default":false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.label").value("Work"));
    }

    @Test
    void deleteAddressReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/profile/addresses/11")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isNoContent());

        verify(profileService).deleteAddress("user@example.com", 11L);
    }

    @Test
    void setDefaultAddressReturnsAddress() throws Exception {
        when(profileService.setDefaultAddress("user@example.com", 11L))
                .thenReturn(new UserAddressResponse(11L, "Work", "User", "user@example.com", "Street 2", "City", "54321", "Country", true));

        mockMvc.perform(patch("/api/profile/addresses/11/default")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.default").value(true));
    }

    @Test
    void getPaymentMethodsReturnsResponse() throws Exception {
        when(profileService.getPaymentMethods("user@example.com"))
                .thenReturn(List.of(new UserPaymentMethodResponse(5L, "Primary", "card", "4242", "01/30", null, true)));

        mockMvc.perform(get("/api/profile/payment-methods")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label").value("Primary"))
                .andExpect(jsonPath("$[0].cardLast4").value("4242"));
    }

    @Test
    void addPaymentMethodReturnsBadRequestForInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/profile/payment-methods")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "label":"Primary",
                                  "method":"card",
                                  "cardLast4":"12",
                                  "cardExpiry":"01/30",
                                  "default":true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("cardLast4 must be 4 digits"));
    }

    @Test
    void setDefaultPaymentMethodReturnsResponse() throws Exception {
        when(profileService.setDefaultPaymentMethod("user@example.com", 5L))
                .thenReturn(new UserPaymentMethodResponse(5L, "Primary", "card", "4242", "01/30", null, true));

        mockMvc.perform(patch("/api/profile/payment-methods/5/default")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.default").value(true));
    }

    @Test
    void deletePaymentMethodReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/profile/payment-methods/5")
                        .principal(new UsernamePasswordAuthenticationToken("user@example.com", "n/a")))
                .andExpect(status().isNoContent());

        verify(profileService).deletePaymentMethod("user@example.com", 5L);
    }
}
