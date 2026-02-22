package org.testautomation;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void signInReturnsTokenAndUser() throws Exception {
        String signUpJson = """
                {
                  "name": "Existing User",
                  "email": "user@example.com",
                  "password": "secret"
                }
                """;
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpJson))
                .andExpect(status().isOk());

        String signInJson = """
                {
                  "email": "user@example.com",
                  "password": "secret",
                  "rememberMe": true
                }
                """;

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signInJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("user@example.com"))
                .andExpect(jsonPath("$.expiresAt").isString());
    }

    @Test
    void signInWithInvalidPayloadReturnsBadRequest() throws Exception {
        String json = """
                {
                  "email": "",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void signInWithWrongPasswordReturnsUnauthorized() throws Exception {
        String signUpJson = """
                {
                  "name": "Wrong Password User",
                  "email": "wrong.password@example.com",
                  "password": "correctPassword"
                }
                """;
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpJson))
                .andExpect(status().isOk());

        String signInJson = """
                {
                  "email": "wrong.password@example.com",
                  "password": "badPassword",
                  "rememberMe": false
                }
                """;

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signInJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void meReturnsCurrentUserWhenSessionIsValid() throws Exception {
        String signUpJson = """
                {
                  "name": "Session User",
                  "email": "session.user@example.com",
                  "password": "secret123"
                }
                """;
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpJson))
                .andExpect(status().isOk());

        String signInJson = """
                {
                  "email": "session.user@example.com",
                  "password": "secret123",
                  "rememberMe": true
                }
                """;

        MvcResult signInResult = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signInJson))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) signInResult.getRequest().getSession(false);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("session.user@example.com"));
    }

    @Test
    void meReturnsUnauthorizedWithoutSession() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Not authenticated"));
    }

    @Test
    void logoutInvalidatesSession() throws Exception {
        String signUpJson = """
                {
                  "name": "Logout User",
                  "email": "logout.user@example.com",
                  "password": "secret123"
                }
                """;
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signUpJson))
                .andExpect(status().isOk());

        String signInJson = """
                {
                  "email": "logout.user@example.com",
                  "password": "secret123",
                  "rememberMe": false
                }
                """;

        MvcResult signInResult = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signInJson))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) signInResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void signUpReturnsUserAndMessage() throws Exception {
        String json = """
                {
                  "name": "New User",
                  "email": "new.user@example.com",
                  "password": "secret123"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("new.user@example.com"))
                .andExpect(jsonPath("$.user.name").value("New User"))
                .andExpect(jsonPath("$.message").value("Account created successfully."));
    }

    @Test
    void signUpWithInvalidPayloadReturnsBadRequest() throws Exception {
        String json = """
                {
                  "name": "",
                  "email": "",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void signUpWithExistingEmailReturnsBadRequest() throws Exception {
        String json = """
                {
                  "name": "Duplicate User",
                  "email": "duplicate@example.com",
                  "password": "secret123"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already in use"));
    }
}
