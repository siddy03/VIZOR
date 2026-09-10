package com.vizor.backend.controller;

import com.vizor.backend.entity.UserRequest;
import com.vizor.backend.repository.UserRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-requests")
public class UserRequestController {

    private final UserRequestRepository repository;

    public UserRequestController(UserRequestRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<UserRequest>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<UserRequest> create(@RequestBody UserRequest request) {
        request.setId(null);
        UserRequest saved = repository.save(request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
