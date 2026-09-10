package com.vizor.backend.service;

import com.vizor.backend.dto.LoginRequest;
import com.vizor.backend.dto.LoginResponse;
import com.vizor.backend.entity.User;
import com.vizor.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Authenticate a user by email and password.
     * Returns the user info on success, or empty if credentials are invalid.
     * Token issuance is handled by the controller (delivered via HttpOnly cookies).
     */
    public Optional<LoginResponse> authenticate(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail());

        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return Optional.empty();
        }

        return Optional.of(toResponse(user));
    }

    /**
     * Look up a user's info by email. Used by /refresh and /me to rebuild the
     * session payload (and to confirm the account still exists).
     */
    public Optional<LoginResponse> getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email).map(this::toResponse);
    }

    private LoginResponse toResponse(User user) {
        return LoginResponse.builder()
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .build();
    }
}
