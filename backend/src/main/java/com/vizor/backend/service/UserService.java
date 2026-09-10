package com.vizor.backend.service;

import com.vizor.backend.dto.UserDto;
import com.vizor.backend.entity.User;
import com.vizor.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> getAll() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<UserDto> getById(Long id) {
        return repository.findById(id).map(this::toDto);
    }

    public UserDto create(UserDto dto) {
        User entity = toEntity(dto, null);
        entity.setId(null);
        if (entity.getPassword() == null || entity.getPassword().isBlank()) {
            // generate a temporary password if the admin didn't supply one
            entity.setPassword(passwordEncoder.encode("Temp@" + System.currentTimeMillis()));
        } else {
            entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (entity.getRole() == null || entity.getRole().isBlank()) {
            entity.setRole("member");
        }
        User saved = repository.save(entity);
        return toDto(saved);
    }

    public Optional<UserDto> update(Long id, UserDto dto) {
        return repository.findById(id).map(existing -> {
            User updated = toEntity(dto, existing);
            updated.setId(id);
            User saved = repository.save(updated);
            return toDto(saved);
        });
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    // ---- Mapping helpers ----

    private UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole());
        dto.setName(u.getName());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setTitle(u.getTitle());
        dto.setCountryCode(u.getCountryCode());
        dto.setPhone(u.getPhone());
        dto.setSalesforceCode(u.getSalesforceCode());
        dto.setPrimaryContact(u.getPrimaryContact());
        dto.setClientName(u.getClientName());
        dto.setRoundtables(u.getRoundtables());
        dto.setActive(u.getActive());
        dto.setLocked(u.getLocked());
        dto.setSuspended(u.getSuspended());
        dto.setEnableNotifications(u.getEnableNotifications());
        dto.setExpiryDate(u.getExpiryDate());
        dto.setLastLoggedIn(u.getLastLoggedIn());
        // never expose password hash
        return dto;
    }

    /**
     * Build a User entity from incoming DTO. If `existing` is non-null the
     * password from the existing record is preserved when the DTO doesn't include one.
     */
    private User toEntity(UserDto dto, User existing) {
        User u = existing != null ? existing : new User();
        u.setEmail(dto.getEmail());
        if (dto.getRole() != null) u.setRole(dto.getRole());
        // 'name' is required by login flow — fall back to firstName + lastName
        String composedName = dto.getName();
        if (composedName == null || composedName.isBlank()) {
            String first = dto.getFirstName() == null ? "" : dto.getFirstName().trim();
            String last = dto.getLastName() == null ? "" : dto.getLastName().trim();
            composedName = (first + " " + last).trim();
            if (composedName.isBlank()) composedName = dto.getEmail();
        }
        u.setName(composedName);
        u.setFirstName(dto.getFirstName());
        u.setLastName(dto.getLastName());
        u.setTitle(dto.getTitle());
        u.setCountryCode(dto.getCountryCode());
        u.setPhone(dto.getPhone());
        u.setSalesforceCode(dto.getSalesforceCode());
        u.setPrimaryContact(dto.getPrimaryContact());
        u.setClientName(dto.getClientName());
        u.setRoundtables(dto.getRoundtables());
        u.setActive(dto.getActive());
        u.setLocked(dto.getLocked());
        u.setSuspended(dto.getSuspended());
        u.setEnableNotifications(dto.getEnableNotifications());
        u.setExpiryDate(dto.getExpiryDate());
        // on update we only re-hash the password if the caller explicitly sent a new one
        if (existing != null && dto.getPassword() != null && !dto.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return u;
    }
}
