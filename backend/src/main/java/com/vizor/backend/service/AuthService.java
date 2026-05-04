package com.vizor.backend.service;

import com.vizor.backend.dto.LoginRequest;
import com.vizor.backend.dto.LoginResponse;
import com.vizor.backend.entity.User;
import com.vizor.backend.repository.UserRepository;
import com.vizor.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Authenticate a user by email and password.
     * Returns a LoginResponse with JWT on success, or empty if credentials are invalid.
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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .build();

        return Optional.of(response);
    }
}
