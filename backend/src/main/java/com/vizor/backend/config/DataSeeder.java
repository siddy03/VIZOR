package com.vizor.backend.config;

import com.vizor.backend.entity.User;
import com.vizor.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds the database with default users on application startup.
 * Only inserts users if they don't already exist.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed AR Admin user
            if (!userRepository.existsByEmailIgnoreCase("ar@ar.com")) {
                User arAdmin = User.builder()
                        .email("ar@ar.com")
                        .password(passwordEncoder.encode("ar123"))
                        .role("ar")
                        .name("AR Admin")
                        .build();
                userRepository.save(arAdmin);
                log.info("Seeded AR Admin user: ar@ar.com");
            }

            // Seed Test User
            if (!userRepository.existsByEmailIgnoreCase("user@user.com")) {
                User testUser = User.builder()
                        .email("user@user.com")
                        .password(passwordEncoder.encode("user123"))
                        .role("member")
                        .name("Test User")
                        .build();
                userRepository.save(testUser);
                log.info("Seeded Test User: user@user.com");
            }
            

            log.info("Database seeding complete. Total users: {}", userRepository.count());
        };
    }
}
