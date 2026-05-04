package com.vizor.backend.controller;

import com.vizor.backend.dto.RoundtableDto;
import com.vizor.backend.service.RoundtableService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/roundtables")
public class RoundtableController {

    private final RoundtableService roundtableService;

    public RoundtableController(RoundtableService roundtableService) {
        this.roundtableService = roundtableService;
    }

    /** GET /api/roundtables - Get all roundtables */
    @GetMapping
    public ResponseEntity<List<RoundtableDto>> getAll() {
        return ResponseEntity.ok(roundtableService.getAll());
    }

    /** GET /api/roundtables/{id} - Get a single roundtable */
    @GetMapping("/{id}")
    public ResponseEntity<RoundtableDto> getById(@PathVariable Long id) {
        return roundtableService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/roundtables - Create a new roundtable */
    @PostMapping
    public ResponseEntity<RoundtableDto> create(@RequestBody RoundtableDto dto) {
        RoundtableDto created = roundtableService.create(dto);
        return ResponseEntity
                .created(URI.create("/api/roundtables/" + created.getId()))
                .body(created);
    }

    /** PUT /api/roundtables/{id} - Update an existing roundtable */
    @PutMapping("/{id}")
    public ResponseEntity<RoundtableDto> update(@PathVariable Long id, @RequestBody RoundtableDto dto) {
        return roundtableService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/roundtables/{id} - Delete a roundtable */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (roundtableService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
